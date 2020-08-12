/**
 * Handle user login and first login
 */
const uuidv4 = require("uuid/v4");
const request = require("request");

const Owner = require("./models/owner.js");
const Logger = require("./utils/logger.js");
const db = require("./database/crud.js");

const appConfig = require(global.discotronConfigPath + "/bot.json");

const users = {};

let hasBotOwner = false;
const ownerSecret = uuidv4();

const clientSecret = appConfig.oauth2Secret;
const clientId = appConfig.applicationId;
const redirectURI = appConfig.redirectURI;

const DISCORD_API_URL = "https://discordapp.com/api/v6/";

module.exports.printOwnershipCode = () => {
    console.log();
    console.log("                          ===== Ownership token =====");
    console.log();
    console.log("  The token below grants owner access once, do NOT give it to someone else.");
    console.log("  You can use right click on Windows to copy it or middle-click clipboard on Linux");
    console.log();
    console.log("                      ------------------------------------");
    console.log("                      " + ownerSecret);
    console.log("                      ------------------------------------");
    console.log();
};

module.exports.isBotOwned = () => hasBotOwner;

/**
 * Called every time a user tries to claim discotron ownership
 * @param {string} userOwnerSecret Token the user provided as an admin token
 * @param {string} discordUserId User that tries claiming ownership
 * @returns {string} Ownership status code (one of `has-bot-owner|wrong-secret|success`)
 */
module.exports.claimOwnership = (userOwnerSecret, discordUserId) => {
    if (hasBotOwner) {
        // Already have an owner
        return "has-bot-owner";
    } else {
        if (ownerSecret !== userOwnerSecret) {
            Logger.warn("User tried claiming ownership with wrong token");
            // Wrong secret
            return "wrong-secret";
        } else {
            // Correct secret, set bot owner
            Owner.setOwners([discordUserId]);
            hasBotOwner = true;
            return "success";
        }
    }
};

/**
 * Called every time a user tries to login, perform required checks
 * @param {string} authToken Discord oauth2 token
 * @returns {object} Object containing success state and optional login data
 */
module.exports.login = async (authToken) => {
    try {
        const accessInfo = await queryAccessToken(authToken);
        const userInfo = await queryDiscordUserId(accessInfo.accessToken);

        if (userInfo.discordId === undefined) {
            throw new Error("No userId was returned by Discord.");
        }

        const appToken = await createOrUpdateAppToken({
            discordUserId: userInfo.discordId,
            accessToken: accessInfo.accessToken,
            refreshToken: accessInfo.refreshToken,
            expireDate: accessInfo.expireDate
        });
        
        Logger.info("Login successful for user", userInfo.username + "#" + userInfo.discriminator);

        return {
            success: true,
            data: {
                token: appToken,
                avatar: userInfo.avatar,
                username: userInfo.username,
                discriminator: userInfo.discriminator,
                discordUserId: userInfo.discordId
            }
        };
    } catch (err) {
        // No identify scope / invalid code
        Logger.debug("Login failed", err);
        return { success: false };
    }
};

/**
 * Try to load app token from the database and update it, or generate one and save the user
 * @param {object} userInfo Information about the user
 * @param {string} userInfo.discordUserId Discord user id
 * @param {string} userInfo.accessToken Access token requested from the oauth2 API
 * @param {string} userInfo.refreshToken Refresh token requested from the oauth2 API
 * @param {number} userInfo.expireDate Date when the refresh token expires
 * @returns {Promise<string>} App token
 */
async function createOrUpdateAppToken(userInfo) {
    const rows = await db.select("Tokens", ["appToken"], {
        discordUserId: userInfo.discordUserId
    });

    // User exists, update it
    if (rows.length === 1) {
        Logger.debug("Discord user with id **" + userInfo.discordUserId + "** logged in using existing information.");

        await db.update("Tokens", {
            accessToken: userInfo.accessToken,
            refreshToken: userInfo.refreshToken,
            expireDate: userInfo.expireDate
        }, {
            discordUserId: userInfo.discordUserId
        });

        return rows[0].appToken;
    } else {
        // User does not exists, create it
        userInfo.appToken = uuidv4();
        await addUser(userInfo);
        return userInfo.appToken;
    }
}

/**
 * Queries the discord API to get the access token
 * @param {string} authToken Auth token requested from the oauth2 API
 * @returns {Promise} resolve(result {object}) result: {accessToken, refreshToken, expireDate}, reject(error {string})
 */
function queryAccessToken(authToken) {
    return new Promise((resolve, reject) => {
        Logger.debug("Query made to Discord API (OAuth2/token)");
        request.post(
            DISCORD_API_URL + "oauth2/token",
            {
                form: {
                    "client_id": clientId,
                    "client_secret": clientSecret,
                    "grant_type": "authorization_code",
                    "code": authToken,
                    "redirect_uri": redirectURI,
                    "scope": "identify,guilds"
                }
            },
            (err, response, body) => {
                if (err !== null) {
                    Logger.debug("Query rejected by Discord", err);
                    reject(err);
                } else {
                    try {
                        const answer = JSON.parse(body);

                        if (answer.error !== undefined) {
                            reject(answer.error);
                        } else {
                            resolve({
                                accessToken: answer.access_token,
                                refreshToken: answer.refresh_token,
                                expireDate: Date.now() + Number.parseInt(answer.expires_in)
                            });
                        }
                    } catch (err) {
                        reject(err);
                    }
                }

            }
        );
    });
}


/**
 * Returns the user id associated with the app token
 * If it is not cached, loads it from database
 * @param {string} appToken App token generated by the app
 * @returns {Promise<string|null>} The userId, or null if not found
 */
module.exports.getDiscordUserId = async (appToken) => {
    if (typeof users[appToken] === "undefined") {
        const rows = await db.select("Tokens", ["discordUserId", "appToken"], {
            appToken: appToken
        });

        if (rows.length === 1) {
            const userId = rows[0].discordUserId;
            users[appToken] = userId;
            return userId;
        } else {
            return null;
        }
    } else {
        return users[appToken];
    }
};



/**
 * Gets the user's id via the discord API
 * @param {string} accessToken access token
 * @returns {Promise} resolve(result {object}) result: {id, avatar, username, discriminator}, reject(error {string})
 */
function queryDiscordUserId(accessToken) {
    return new Promise((resolve, reject) => {

        Logger.debug("Query made to Discord API (users/@me)");
        request({
            url: DISCORD_API_URL + "users/@me",
            headers: {
                "Authorization": "Bearer " + accessToken
            }
        }, (err, response, body) => {
            if (err === null) {
                try {
                    const result = JSON.parse(body);
                    resolve({
                        discordId: result.id,
                        avatar: result.avatar,
                        username: result.username,
                        discriminator: result.discriminator
                    });
                } catch (err) {
                    reject(err);
                }
            } else {
                Logger.debug("Got an error while querying discord", err);
                reject(err);
            }
        });
    });
}

/**
 * Add a user to the database
 * @param {object} userInfo Information about the user
 * @param {string} userInfo.discordUserId Discord user id
 * @param {string} userInfo.appToken App token generated by the app
 * @param {string} userInfo.accessToken OAuth2 access token
 * @param {string} userInfo.refreshToken OAuth2 refresh token
 * @param {number} userInfo.expireDate OAuth2 expire date
 */
async function addUser(userInfo) {
    Logger.debug("Discord user with id **" + userInfo.discordUserId + "** logged in for the first time.");
    users[userInfo.appToken] = userInfo.discordUserId;

    await db.insert("Users", {
        discordUserId: userInfo.discordUserId
    });
    await db.insert("Tokens", userInfo);
}

module.exports.updateHasBotOwner = async () => {
    try {
        const owners = await Owner.getOwners();
        hasBotOwner = owners.length > 0;
    } catch (e) {
        Logger.err("Unable to retrieve ownership list from database. Following error has occured:", e);
    }
};

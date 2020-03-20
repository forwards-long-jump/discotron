/**
 * Handle user login and first login
 */
const uuidv1 = require("uuid/v1");
const request = require("request");

const Owner = require("./models/owner.js");
const Logger = require("./utils/logger.js");
const db = require("./database/crud.js");

const appConfig = require(global.discotronConfigPath + "/bot.json");

const users = {};
let firstLaunch = false;
let ownerSecret;

const clientSecret = appConfig.oauth2Secret;
const clientId = appConfig.applicationId;
const redirectURI = appConfig.redirectURI;

const discordApiUrl = "https://discordapp.com/api/v6/";

/**
 * Called every time a user tries to claim discotron ownership
 * @param {string} authToken Discord oauth2 token
 * @param {Function} reply Function to call to end the request
 * @param {string} [userOwnerSecret=undefined] Token the user provided as an admin token
 */
module.exports.claimOwnership = function (authToken, reply, userOwnerSecret = undefined) {
    if (firstLaunch) {
        module.exports.handleLogin(authToken, reply, userOwnerSecret);
    } else {
        reply({
            status: "error"
        });
    }
};

/**
 * Called every time a user tries to login, perform required checks
 * @param {string} authToken Discord oauth2 token
 * @param {Function} reply Function to call to end the request
 * @param {string} [userOwnerSecret=undefined] Token the user provided as an admin token
 */
module.exports.handleLogin = function (authToken, reply, userOwnerSecret = undefined) {
    if (firstLaunch) {
        if (userOwnerSecret === undefined) {
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

            // First launch, ask for more details
            reply({
                status: "first-launch"
            });
        } else if (ownerSecret === undefined || ownerSecret !== userOwnerSecret) {
            Logger.debug("Wrong secret provided");
            // Wrong secret
            reply({
                status: "error"
            });
        } else {
            // Correct secret, try get app token
            handleDiscordAPIQuery(authToken, reply, true);
        }
    } else {
        handleDiscordAPIQuery(authToken, reply);
    }
};

/**
 * Get access token, query discord user id
 * @param {string} authToken Discord oauth2 token
 * @param {Function} reply Function to call to end the request
 * @param {boolean} [addOwner=false] Set it to true to add the user to the owner list
 */
async function handleDiscordAPIQuery(authToken, reply, addOwner = false) {
    try {
        const accessInfo = await getAccessToken(authToken);
        const userInfo = await queryDiscordUserId(accessInfo.accessToken);

        if (userInfo.discordId === undefined) {
            throw new Error("No discordId specified");
        }

        const appToken = await requestAppToken({
            discordUserId: userInfo.discordId,
            accessToken: accessInfo.accessToken,
            refreshToken: accessInfo.refreshToken,
            expireDate: accessInfo.expireDate
        });

        if (addOwner) {
            Owner.setOwners([userInfo.discordId]);
            ownerSecret = undefined;
            firstLaunch = false;
        }

        reply({
            status: "success",
            token: appToken,
            avatar: userInfo.avatar,
            username: userInfo.username,
            discriminator: userInfo.discriminator,
            discordUserId: userInfo.discordId
        });
    } catch (err) {
        Logger.err("handleDiscordAPIQuery failed", err);
        // No identify scope / invalid code
        reply({
            status: "error"
        });
    }
}

/**
 * Try to load app token from the database and update it, or generate one and save the user
 * @param {object} userInfo Information about the user
 * @param {string} userInfo.discordUserId Discord user id
 * @param {string} userInfo.accessToken Access token requested from the oauth2 API
 * @param {string} userInfo.refreshToken Refresh token requested from the oauth2 API
 * @param {number} userInfo.expireDate Date when the refresh token expires
 * @returns {Promise<string>} App token
 */
async function requestAppToken(userInfo) {
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
        // eslint-disable-next-line require-atomic-updates
        userInfo.appToken = uuidv1();
        await addUser(userInfo);
        return userInfo.appToken;
    }
}

/**
 * Queries the discord API to get the access token
 * @param {string} authToken Auth token requested from the oauth2 API
 * @returns {Promise} resolve(result {object}) result: {accessToken, refreshToken, expireDate}, reject(error {string})
 */
function getAccessToken(authToken) {
    return new Promise((resolve, reject) => {
        Logger.debug("Query made to Discord API (OAuth2/token)");
        request.post(
            discordApiUrl + "oauth2/token",
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
module.exports.getDiscordUserId = async function (appToken) {
    if (typeof users[appToken] === "undefined") {
        const rows = await db.select("Tokens", ["discordUserId", "appToken"], {
            appToken: appToken
        });

        if (rows.length === 1) {
            const userId = rows[0].discordUserId;
            // eslint-disable-next-line require-atomic-updates
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
            url: discordApiUrl + "users/@me",
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
 * @returns {Promise} resolve(), reject(error {string})
 */
function addUser(userInfo) {
    Logger.debug("Discord user with id **" + userInfo.discordUserId + "** logged in for the first time.");
    users[userInfo.appToken] = userInfo.discordUserId;

    return db.insert("Users", {
        discordUserId: userInfo.discordUserId
    }).then(() => db.insert("Tokens", userInfo));
}

/**
 * Put Discotron in "first launch" mode when called, allows creating a new admin
 */
module.exports.setFirstLaunch = function () {
    firstLaunch = true;
    ownerSecret = uuidv1();
};

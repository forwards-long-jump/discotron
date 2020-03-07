/**
 * Handle user login and first login
 */
const uuidv1 = require("uuid/v1");
const request = require("request");

const webAPI = require("../dashboard/backend/api.js").getWebAPI("discotron-dashboard");
const Owner = require("./models/owner.js");
const Logger = require("./utils/logger.js");
const db = require("./database/crud.js");

const appConfig = require(global.discotronConfigPath + "/bot.json");

let users = {};
let firstLaunch = false;
let ownerSecret;

let clientSecret = appConfig.oauth2Secret;
let clientId = appConfig.applicationId;
let redirectURI = appConfig.redirectURI;

const discordApiUrl = "https://discordapp.com/api/v6/";

/**
 * Called every time a user tries to login, perform required checks
 * @param {string} authToken Discord oauth2 token
 * @param {Function} reply Function to call to end the request
 * @param {string} [userOwnerSecret=undefined] Token the user provided as an admin token
 */
function handleLogin(authToken, reply, userOwnerSecret = undefined) {
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
            Logger.log("Wrong secret provided");
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
}

/**
 * Get access token, query discord user id
 * @param {string} authToken Discord oauth2 token
 * @param {Function} reply Function to call to end the request
 * @param {boolean} [addOwner=false] Set it to true to add the user to the owner list
 */
function handleDiscordAPIQuery(authToken, reply, addOwner = false) {
    let accessInfo;
    let userInfo;

    getAccessToken(authToken).then((accessInfo_) => {
        accessInfo = accessInfo_;
        return queryDiscordUserId(accessInfo.accessToken);
    }).then((userInfo_) => {
        userInfo = userInfo_;
        if (userInfo.discordId !== undefined) {
            return requestAppToken(userInfo.discordId, accessInfo.accessToken, accessInfo.refreshToken, accessInfo.expireDate);
        } else {
            return Promise.reject();
        }
    }).then((appToken) => {
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

    })
        .catch((err) => {
            Logger.err("handleDiscordAPIQuery failed");
            Logger.err(err);
            // No identify scope / invalid code
            reply({
                status: "error"
            });

        });
}

/**
 * Try to load app token from the database and update it, or generate one and save the user
 * @param {string} discordUserId Discord user id
 * @param {string} accessToken Access token requested from the oauth2 API
 * @param {string} refreshToken Refresh token requested from the oauth2 API
 * @param {number} expireDate Date when the refresh token expires
 * @returns {Promise} resolve(appToken {string})
 */
function requestAppToken(discordUserId, accessToken, refreshToken, expireDate) {
    return new Promise((resolve, reject) => {
        return db.select("Tokens", ["appToken"], {
            discordUserId: discordUserId
        }).then((rows) => {
            // User exists, update it
            if (rows.length === 1) {
                Logger.log("Discord user with id **" + discordUserId + "** logged in using existing information.");

                return db.update("Tokens", {
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    expireDate: expireDate
                }, {
                    discordUserId: discordUserId
                }).then(() => {
                    resolve(rows[0].appToken);
                });

            } else {
                // User does not exists, create it
                let appToken = uuidv1();
                return addUser(discordUserId, appToken, accessToken, refreshToken, expireDate).then(() => {
                    resolve(appToken);
                });
            }
        });
    });
}

/**
 * Queries the discord API to get the access token
 * @param {string} authToken Auth token requested from the oauth2 API
 * @returns {Promise} resolve(result {object}) result: {accessToken, refreshToken, expireDate}, reject(error {string})
 */
function getAccessToken(authToken) {
    return new Promise((resolve, reject) => {
        Logger.log("Query made to Discord API (OAuth2/token)");
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
                    Logger.log("Query rejected by Discord");
                    Logger.log(err);
                    reject(err);
                } else {
                    try {
                        let answer = JSON.parse(body);

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
 * @param {string} appToken 
 * @returns {Promise} resolve(appToken {string|false}) appToken: false if could not get token
 */
function getDiscordUserId(appToken) {
    return new Promise((resolve, reject) => {
        if (typeof users[appToken] === "undefined") {
            return db.select("Tokens", ["discordUserId", "appToken"], {
                appToken: appToken
            }).then((rows) => {
                if (rows.length === 1) {
                    users[rows[0].appToken] = rows[0].discordUserId;
                    resolve(rows[0].discordUserId);
                } else {
                    resolve(false);
                }
            });
        } else {
            resolve(users[appToken]);
        }
    });
}



/**
 * Gets the user's id via the discord API
 * @param {string} accessToken access token
 * @returns {Promise} resolve(result {object}) result: {id, avatar, username, discriminator}, reject(error {string})
 */
function queryDiscordUserId(accessToken) {
    return new Promise((resolve, reject) => {

        Logger.log("Query made to Discord API (users/@me)");
        request({
            url: discordApiUrl + "users/@me",
            headers: {
                "Authorization": "Bearer " + accessToken
            }
        }, (err, response, body) => {
            if (err === null) {
                try {
                    let result = JSON.parse(body);
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
                Logger.log("Got an error while querying discord");
                Logger.log(err);
                reject(err);
            }
        });
    });
}

/**
 * Add a user to the database
 * @param {string} discordId Discord user id
 * @param {string} appToken App token generated by the app
 * @param {string} accessToken OAuth2 access token
 * @param {string} refreshToken OAuth2 refresh token
 * @param {number} expireDate OAuth2 expire date
 * @returns {Promise} resolve(), reject(error {string})
 */
function addUser(discordId, appToken, accessToken, refreshToken, expireDate) {
    Logger.log("Discord user with id **" + discordId + "** logged in for the first time.");
    users[appToken] = discordId;

    return db.insert("Users", {
        discordUserId: discordId
    }).then(() => db.insert("Tokens", {
        discordUserId: discordId,
        accessToken: accessToken,
        appToken: appToken,
        refreshToken: refreshToken,
        expireDate: expireDate
    }));
}

/**
 * Register webAPI actions related to log-in
 */
function registerActions() {
    webAPI.registerAction("claim-ownership", (data, reply) => {
        if (firstLaunch) {
            handleLogin(data.code, reply, data.ownerSecret);
        } else {
            reply({
                status: "error"
            });
        }
    });

    webAPI.registerAction("login", (data, reply) => {
        handleLogin(data.code, reply);
    });
}

/**
 * Put Discotron in "first launch" mode when called, allows creating a new admin
 */
function setFirstLaunch() {
    firstLaunch = true;
    ownerSecret = uuidv1();
}

module.exports.setFirstLaunch = setFirstLaunch;
module.exports.registerActions = registerActions;
module.exports.getDiscordUserId = getDiscordUserId;
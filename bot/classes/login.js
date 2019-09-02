const webAPI = require("../apis/web-api.js").getWebAPI("discotron-dashboard");
const Owner = require("./owner.js");
const uuidv1 = require("uuid/v1");
const request = require("request");
const Logger = require("../utils/logger.js");
const db = require("../apis/database-crud.js");

const appConfig = require("../config/app-config.json");

let users = {};
let firstLaunch = false;
let ownerSecret = uuidv1();

let clientSecret = appConfig.oauth2Secret;
let clientId = appConfig.applicationId;
let redirectURI = appConfig.redirectURI;

const discordApiUrl = "https://discordapp.com/api/v6/";

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
        } else if (ownerSecret !== userOwnerSecret) {
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
 * Get access token, query id
 * @param {string} authToken 
 * @param {function} reply 
 * @param {boolean} addOwner 
 */
function handleDiscordAPIQuery(authToken, reply, addOwner = false) {
    let accessInfo;

    getAccessToken(authToken).then((accessInfo_) => {

            accessInfo = accessInfo_;
            return queryDiscordUserId(accessInfo.accessToken);

        }).then((discordId) => {

            if (addOwner) {
                Owner.add(discordId);
                ownerSecret = undefined;
                firstLaunch = false;
            }

            return requestAppToken(discordId, accessInfo.accessToken, accessInfo.refreshToken, accessInfo.expireDate);
        }).then((appToken) => {

            reply({
                status: "success",
                token: appToken
            });

        })
        .catch(() => {

            // No clientId scope / invalid code
            reply({
                status: "error"
            });

        });
}

/**
 * Try to load app token from the database and update it, or generate one and save the user
 * @param {string} discordId 
 * @param {string} accessToken 
 * @param {string} refreshToken 
 * @param {number} expireDate 
 * @returns {Promise}
 */
function requestAppToken(discordId, accessToken, refreshToken, expireDate) {
    return new Promise((resolve, reject) => {
        db.select("Tokens", ["appToken"], {
            discordUserId: discordId
        }).then((rows) => {
            // User exists, update it
            if (rows.length === 1) {
                Logger.log("Discord user with id **" + discordId + "** logged in using existing informations.");
                db.update("Tokens", {
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    expireDate: expireDate
                }, {
                    discordUserId: discordId
                });

                resolve(rows[0].appToken);
            } else {
                // User does not exists, create it
                let appToken = uuidv1();
                addUser(discordId, appToken, accessToken, refreshToken, expireDate).then(() => {
                    resolve(appToken);
                });
            }
        });
    });
}

/**
 * Queries the discord API to get the access token
 * @param {string} authToken 
 * @returns Promise
 */
function getAccessToken(authToken) {
    return new Promise((resolve, reject) => {
        Logger.log("Query made to Discord API (OAuth2/token)");
        request.post(
            discordApiUrl + "oauth2/token", {
                form: {
                    "client_id": clientId,
                    "client_secret": clientSecret,
                    "grant_type": "authorization_code",
                    "code": authToken,
                    "redirect_uri": redirectURI,
                    "scope": "identify,guilds"
                }
            },
            (error, response, body) => {

                if (error !== null) {
                    reject();
                } else {
                    try {
                        let answer = JSON.parse(body);

                        if (answer.error !== undefined) {
                            reject();
                        } else {
                            resolve({
                                accessToken: answer.access_token,
                                refreshToken: answer.refresh_token,
                                expireDate: Date.now() + Number.parseInt(answer.expires_in)
                            });
                        }
                    } catch (e) {
                        reject();
                    }
                }

            }
        );
    });
}


/**
 * Returns the client ID associated with the app token
 * If it is not cached, loads it from database
 * 
 * @param {string} appToken 
 * @returns Promise
 */
function getDiscordUserId(appToken) {
    return new Promise((resolve, reject) => {
        if (typeof users[appToken] === "undefined") {
            db.select("Tokens", ["discordUserId", "appToken"], {
                appToken: appToken
            }).then((rows) => {
                if (rows.length === 1) {
                    users[rows[0].appToken] = rows[0].discordUserId;
                    resolve(rows[0].discordUserId);
                } else {
                    reject();
                }
            }).catch(() => reject);
        } else {
            resolve(users[appToken]);
        }
    });
}



/**
 * Gets the user's client ID via the discord API
 * @param {*} accessToken 
 * @returns Promise
 */
function queryDiscordUserId(accessToken) {
    return new Promise((resolve, reject) => {

        Logger.log("Query made to Discord API (users/@me)");
        request({
            url: discordApiUrl + "users/@me",
            headers: {
                "Authorization": "Bearer " + accessToken
            }
        }, (error, response, body) => {
            if (error === null) {
                try {
                    let result = JSON.parse(body);
                    resolve(result.id);
                } catch (err) {
                    reject();
                }
            } else {
                reject();
            }
        });
    });
}

/**
 * Add a user to the database
 * @param {string} discordId 
 * @param {string} accessToken 
 * @param {string} appToken 
 * @param {string} refreshToken 
 * @param {number} expireDate 
 * @returns {Promise}
 */
function addUser(discordId, appToken, accessToken, refreshToken, expireDate) {
    return new Promise((resolve, reject) => {
        Logger.log("Discord user with id **" + discordId + "** logged in for the first time.");
        users[appToken] = discordId;

        db.insert("Tokens", {
            discordUserId: discordId,
            accessToken: accessToken,
            appToken: appToken,
            refreshToken: refreshToken,
            expireDate: expireDate
        }).then(() => resolve).catch(() => reject);
    });
}

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

function setFirstLaunch(firstLaunch_) {
    firstLaunch = firstLaunch_;
}

module.exports.setFirstLaunch = setFirstLaunch;
module.exports.registerActions = registerActions;
module.exports.getDiscordUserId = getDiscordUserId;
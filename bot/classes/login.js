const webAPI = require("../apis/web-api.js").getWebAPI("discotron-dashboard");
const Owner = require("./owner.js");
const uuidv1 = require("uuid/v1");
const request = require("request");
const Logger = require("../utils/logger.js");

const appConfig = require("../config/app-config.json");

let users = {};
let firstLaunch = true;
let ownerSecret = uuidv1();

let clientSecret = appConfig.oauth2Secret;
let clientId = appConfig.applicationId;
let redirectURI = appConfig.redirectURI;


function handleLogin(authToken, reply, userOwnerSecret = undefined) {
    Logger.log("lel")
    if (firstLaunch) {
        if (userOwnerSecret === undefined) {
            Logger.log("reply first launch");
            // First launch, ask for more details
            reply({
                status: "first-launch"
            });
        } else if (ownerSecret !== userOwnerSecret) {
            Logger.log("Wrong secret");
            // Wrong secret
            reply({
                status: "error"
            });
        } else {
            Logger.log("Query discord");
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
    getAccessToken(authToken).then((accessToken, refreshToken, expireDate) => {
        queryDiscordUserId(accessToken).then((discordId) => {
            let appToken = createAppToken();

            if (addOwner) {
                Owner.add(discordId);
            }

            addUser(discordId, appToken, accessToken, refreshToken, expireDate);

            reply({
                status: "success",
                token: appToken
            });
        }).catch(() => {
            // No clientId scope / invalid code
            reply({
                status: "error"
            });
        });
    }).catch(() => {
        // No clientId scope / invalid code
        reply({
            status: "error"
        });
    });
}

/**
 * Queries the discord API to get the access token
 * @param {string} authToken 
 * @returns Promise
 */
function getAccessToken(authToken) {
    request.post(
        "https://discordapp.com/api/v6/oauth2/token", {
            form: {
                "client_id": clientId,
                "client_secret": clientSecret,
                "grant_type": "authorization_code",
                "code": authToken,
                "redirect_uri": redirectURI,
                "scope": "identify,guilds"
            }
        },
        function (error, response, body) {
            console.log(error, response, body);

        }
    );
}


/**
 * Returns the client ID associated with the app token
 * @param {string} appToken 
 * @returns Promise
 */
function getDiscordUserId(appToken) {
    // return this.users[appToken] ...
}



/**
 * Gets the user's client ID via the discord API
 * @param {*} accessToken 
 * @returns Promise
 */
function queryDiscordUserId(accessToken) {

}

/**
 * Generates a key for the user
 * @returns string
 */
function createAppToken() {
    return uuidv1();
}

/**
 * Generates a key for the user
 * @returns string
 */
function handleFirstLaunch() {
    // if Owner.hasAnyOwner()...
    //         this.noOwnersRegistered = true;
}

/**
 * Add a user to the database
 * @param {string} discordId 
 * @param {string} accessToken 
 * @param {string} appToken 
 * @param {string} refreshToken 
 * @param {number} expireDate 
 */
function addUser(discordId, appToken, accessToken, refreshToken, expireDate) {

}

function registerActions() {
    webAPI.registerAction("claim-ownership", (data, reply) => {
        handleLogin(data.code, reply, data.ownerSecret);
    });

    webAPI.registerAction("login", (data, reply) => {
        handleLogin(data.code, reply);
    });
}
console.log(ownerSecret);

function setFirstLaunch(firstLaunch_) {
    // TODO: Log ownerSecret if first launch
    firstLaunch = firstLaunch_;
}

module.exports.setFirstLaunch = setFirstLaunch;
module.exports.registerActions = registerActions;
module.exports.getDiscordUserId = getDiscordUserId;
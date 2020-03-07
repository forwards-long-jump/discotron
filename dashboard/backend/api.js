/**
 * Handles communication between the dashboard and the bot
 */
const Logger = require("../../core/utils/logger.js");

let actions = {};

/**
 * Listen for requests on the /api endpoint
 * @param {object} req Request object from express
 * @param {object} res Result object from express
 */
module.exports.onPost = (req, res) => {
    if (req === undefined || req.body === undefined) {
        return;
    }

    let plugin = req.body.plugin;
    let action = req.body.action;
    let data = req.body.data;
    let appToken = req.body.appToken;
    let discordGuildId = req.body.discordGuildId;

    if (actions[plugin] === undefined || actions[plugin][action] === undefined) {
        reply(res, "invalid-action");
        Logger.log("[WebAPI] Invalid action triggered: " + plugin + "/" + action, "warn");
        return;
    }

    Login.getDiscordUserId(appToken).then((discordUserId) => {
        let response = actions[plugin][action];

        Logger.log("[WebAPI] Received " + plugin + "/" + action);

        if (appToken !== undefined && discordUserId === false) {
            // Provided an invalid app token
            reply(res, "invalid-app-token");
        } else if (authLevelCheck[response.authLevel](discordUserId, discordGuildId)) {
            // Permission granted
            response.action(data, (requestedData) => {
                reply(res, requestedData);
            }, discordUserId, discordGuildId);
        } else {
            // Permission refused (should not happen!)
            Logger.log("[WebAPI] Insufficient permission to execute " + plugin + "/" + action, "warn");
            reply(res, "invalid-app-token");
        }
    }).catch(console.error);
};

/**
 * Replies to a query
 * @param {object} res Result object from express 
 * @param {object} data Will be JSON.stringified and sent to the user 
 */
function reply(res, data) {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
}


/**
 * Generate a function specifically for a pluginId, allowing to not pass the id every time
 * @param {string} pluginId Id of the plugin to use
 * @returns {object} Object containing a custom registerAction function
 */
module.exports.getWebAPI = (pluginId) => {
    return {
        registerAction: function (name, action, authLevel = "everyone") {
            registerAction(pluginId, name, action, authLevel);
        }
    };
};


/**
 * Register an action to be triggered by a webpage
 * @param {string} pluginId     Plugin ID
 * @param {string} name         Action name
 * @param {Function} action     Action to trigger, *data* is passed as argument to the function
 * @param {string} [authLevel="everyone"]    User "level" required to trigger this action, can be *everyone*, *guildAdmin*, *owner*
 */
function registerAction(pluginId, name, action, authLevel = "everyone") {
    // TODO: Create registerActions that takes an object with action -> {} and pass it better params
    if (typeof actions[pluginId] === "undefined") {
        actions[pluginId] = {};
    }

    if (typeof actions[pluginId][name] !== "undefined") {
        throw new Error(`Action with name ${name} already exists for plugin ${pluginId}`);
    }

    actions[pluginId][name] = {
        action: action,
        authLevel: authLevel
    };

    Logger.log(`Registered action ${name} for plugin ${pluginId}`, "debug");
}

// Object containing a method for each level of authentication
const authLevelCheck = {
    "owner": require("../../core/models/owner.js").isOwner,
    "guildAdmin": require("../../core/models/guild.js").isGuildAdmin,
    "everyone": () => true
};

const Login = require("../../core/login.js");
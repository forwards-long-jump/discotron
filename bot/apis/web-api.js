const Logger = require("../utils/logger.js");

/**
 * Handles receiving message from dashboard
 */
let actions = {};

/**
 * Starts listening on the /api endpoint
 */
module.exports.onPost = (req, res) => {
    if (req === undefined || req.body === undefined) {
        return;
    }

    let plugin = req.body.plugin;
    let action = req.body.action;
    let data = req.body.data;
    let appToken = req.body.appToken;
    let guildId = req.body.guildId;

    if (actions[plugin] === undefined || actions[plugin][action] === undefined) {
        reply(res, "invalid-action");
        return;
    }

    Login.getDiscordUserId(appToken).then((clientId) => {
        let response = actions[plugin][action];

        Logger.log("[WebAPI] Action triggered: " + action);
        if (authLevelCheck[response.authLevel](clientId, guildId)) {
            response.action(data, (requestedData) => {
                reply(res, requestedData);
            }, clientId, guildId);
        } else {
            Logger.log("Wrong app token / perm", "warn");
            reply(res, "invalid-app-token");
        }
    });
};

function reply(res, data) {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
}


/**
 * Returns a WebAPI tagged with a plugin pluginId
 * @param {String} pluginId Id of the plugin to use
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
 * @param {string} pluginId     Id of the plugin
 * @param {string} name         Name of the action
 * @param {function} action     Action to trigger, *data* is passed as argument
 * @param {string} [authLevel="connected"]    User "level" required to trigger this action, can be *everyone*, *guildAdmin*, *owner*
 */
function registerAction(pluginId, name, action, authLevel = "everyone") {
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

/**
 * Authentification methods for each level
 */
const authLevelCheck = {
    "owner": require("../classes/owner.js").isOwner,
    "guildAdmin": require("../classes/guild.js").isGuildAdmin,
    "everyone": () => true
};

const Login = require("../classes/login.js");
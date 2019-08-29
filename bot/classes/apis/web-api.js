/**
 * Handles receiving message from dashboard
 */
let actions = {};

/**
 * Starts listening on the /api endpoint
 */
function startAPIServer() {
    //TODO
}

startAPIServer();


/**
 * Returns a WebAPI tagged with a plugin pluginId
 * @param {String} pluginId Id of the plugin to use
 */
module.exports.getWebAPI = (pluginId) => {
    return {
        registerAction: function (name, action) {
            registerAction(pluginId, name, action);
        }
    };
};

/**
 * Register an action to be triggered by a webpage
 * @param {string} pluginId     Id of the plugin
 * @param {string} name         Name of the action
 * @param {function} action     Action to trigger, *data* is passed as argument
 * @param {string} [authLevel="connected"]    User "level" required to trigger this action, can be *everyone*, *connected*, *owner*
 */
function registerAction(pluginId, name, action, authLevel = "connected") {
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
}
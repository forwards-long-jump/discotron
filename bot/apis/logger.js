let logs = {};

/**
 * Gives a logger able to write in the given plugin's log
 * @param {String} pluginId pluginId of the plugin to write logs to
 */
module.exports.getLogger = (pluginId) => {
    return {
        log: function (message) {
            log(message, pluginId);
        }
    };
};

/**
 * Gives the logs associated with the plugin
 * @param {String} pluginId pluginId of the plugin to write 
 */
module.exports.getLogs = (pluginId) => {
    return logs[pluginId];
};

/**
 * Writes the message in the plugin's log
 * @param {string} message Message to write
 * @param {String} pluginId Id of the plugin to write 
 */
function log(message, pluginId) {
    if (typeof logs[pluginId] === "undefined") {
        logs[pluginId] = [];
    }

    logs[pluginId].push(message);
}
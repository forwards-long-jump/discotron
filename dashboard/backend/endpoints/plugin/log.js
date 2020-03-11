const webAPI = require("../../api.js").getWebAPI("discotron-dashboard");
const Plugin = require("../../../../core/models/plugin.js");

webAPI.registerAction("get-plugin-logs", (data, reply) => {
    reply(Plugin._plugins[data.pluginId].logs);
}, "owner");

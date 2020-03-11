const webAPI = require("../../api.js").getWebAPI("discotron-dashboard");

webAPI.registerAction("get-plugin-logs", (data, reply) => {
    reply(Plugin._plugins[data.pluginId].logs);
}, "owner");

const webAPI = require("../api.js").getWebAPI("discotron-dashboard");
const Plugin = require("../../../core/models/plugin.js");
const Owner = require("../../../core/models/owner.js");

webAPI.registerAction("get-plugins", (data, reply, userDiscordId) => {
    const pluginsObjects = [];

    const plugins = Plugin.getAll();
    for (const key in plugins) {
        if (Object.prototype.hasOwnProperty.call(plugins, key)) {
            pluginsObjects.push(Plugin.getAll()[key].toObject(!Owner.isOwner(userDiscordId)));
        }
    }

    reply(pluginsObjects);
});

webAPI.registerAction("get-enabled", (data, reply) => {
    if (Plugin._plugins[data.pluginId] !== undefined) {
        reply(Plugin._plugins[data.pluginId].enabled);
    } else {
        reply(false);
    }
});

webAPI.registerAction("set-enabled", (data, reply) => {
    Plugin._plugins[data.pluginId].enabled = data.enabled;
    reply();
}, "owner");

webAPI.registerAction("get-plugin-prefix", (data, reply) => {
    if (Plugin._plugins[data.pluginId] !== undefined) {
        reply(Plugin._plugins[data.pluginId].prefix);
    } else {
        reply(false);
    }
});

webAPI.registerAction("set-plugin-prefix", (data, reply) => {
    Plugin._plugins[data.pluginId].prefix = data.prefix;
    reply();
}, "owner");

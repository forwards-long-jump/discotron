window.Discotron.WebAPI = class {
    /**
     * Send a query to the bot via the API
     * @param {string} plugin Plugin ID, can also be "discotron" to indicate the action is directed toward the bot
     * @param {string} action Name of the action
     * @param {object} data Data
     */
    static queryBot(plugin, action, data, guildId = undefined) {
        let params = {
            plugin: plugin,
            action: action,
            data: data,
            // TODO: send app token
        };
        if (guildId) {
            params.guildId = guildId;
        }
        return Discotron.utils.post("/api", params);
    }
};
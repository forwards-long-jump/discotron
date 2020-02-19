window.discotron.WebAPI = class {
    /**
     * Send a query to the bot via the API
     * @static
     * @param {string} plugin Plugin ID, can also be "discotron" to indicate the action is directed toward the bot
     * @param {string} action Name of the action
     * @param {object} data Data that will JSON.stringified and sent to the bot
     * @param {object} [discordGuildId=undefined] Specify to which guild this action is targeted to
     * @returns {Promise} resolve(data {object}) data: result given by the API, reject()
     */
    static queryBot(plugin, action, data = undefined, discordGuildId = undefined) {
        let params = {
            plugin: plugin,
            action: action,
            data: data,
            appToken: localStorage.appToken
        };

        if (discordGuildId) {
            params.discordGuildId = discordGuildId;
        }

        return new Promise((resolve, reject) => {
            return discotron.utils.post("/api", params).then((data) => {
                if (data === "invalid-app-token") {
                    localStorage.clear();
                    window.location.replace("/login");
                } else {
                    resolve(data);
                }
            });
        });
    }
};
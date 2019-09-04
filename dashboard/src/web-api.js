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
            appToken: localStorage.appToken
        };
        if (guildId) {
            params.guildId = guildId;
        }

        return new Promise((resolve, reject) => {
            Discotron.utils.post("/api", params).then((data) => {
                if (data === "invalid-app-token") {
                    localStorage.clear();
                    window.location.replace("/login");
                } else {
                    resolve(data);
                }
            }).catch(() => {
                console.error("Could not query bot");
            });
        });
    }
};
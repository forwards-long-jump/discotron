window.Discotron.Router = class {

    /**
     * Parse URL and call the right new specificController(...)
     * @param {string} url URL to route to
     */
    static route(url) {
        let parsedURL = Discotron.Router._parseURL(url);

        const controllers = {
            "bot-status": Discotron.BotStatusController,
            "plugin-list": Discotron.PluginListController,
            "repository-list": Discotron.RepositoryListController,
            "guild-settings": Discotron.GuildSettingsController
        };

        let Controller = controllers[parsedURL.page];
        if (Controller !== undefined) {
            new Controller(parsedURL.args);
        }
    }

    /**
     * Find which controller is to be called
     * @returns {object}
     */
    static _parseURL(url) {
        // Check if on correct page and split # 
        // <url>/dashboard#truc?machin=true
        let urlRegex = /dashboard\/?#?([a-z\-]*)\??(.*)/;
        let match = urlRegex.exec(url);

        if (match === null) {
            return false;
        }
        let args = {};

        if (match[2] !== "") {
            let couples = match[2].split("&");

            for (let i = 0; i < couples.length; i++) {
                let split = couples[i].split("=");
                if (split.length === 2) {
                    args[split[0]] = split[1];
                }
            }
        }

        return {
            page: match[1],
            args: args
        };
    }

    static _onUrlChange(event) {
        Discotron.Router.route(event.newURL);
        // Detect if it's still our domain and /dashboard
        // if previous url is not the same, push to history
        // route()
    }

    static addEvents() {
        window.addEventListener("hashchange", Discotron.Router._onUrlChange);
    }
};
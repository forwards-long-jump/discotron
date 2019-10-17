/**
 * Handle routes
 */
window.Discotron.Router = class {
    /**
     * Parse URL and call the right new specificController(...)
     * @static
     * @param {string} url URL to route to
     */
    static route(url) {
        let parsedURL = Discotron.Router._parseURL(url);

        const controllers = {
            "home": Discotron.HelpController,
            "bot-status": Discotron.BotStatusController,
            "plugin-list": Discotron.PluginListController,
            "repository-list": Discotron.RepositoryListController,
            "guild-settings": Discotron.GuildSettingsController
        };

        let Controller = controllers[parsedURL.page];
        if (Controller !== undefined) {
            new Controller(parsedURL.args);
        } else {
            new Discotron.HelpController();
        }
    }

    /**
     * Find which controller is to be called
     * @static
     * @returns {object|false} False if invalid url or {page: pageName, args: args}
     */
    static _parseURL(url) {
        // Check if on correct page and split # 
        // <url>/dashboard#page?arg1=true
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

    /**
     * Should be called when the hash is changed, reroute
     * @static
     * @param {hashchangeevent} event 
     */
    static _onUrlChange(event) {
        Discotron.Router.route(event.newURL);
    }

    /**
     * Add events needed by the router to work
     * @static
     */
    static addEvents() {
        window.addEventListener("hashchange", Discotron.Router._onUrlChange);
    }
};
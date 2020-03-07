/**
 * Controller for the plugin list page
 */
window.discotron.PluginListController = class extends window.discotron.Controller {
    /**
     * @class
     * @param {object} args Args given by the user in the URL
     */
    constructor(args) {
        super("admin/plugin-list.html", () => {
            this._discordGuildId = args.guild;

            if (this._discordGuildId === undefined) {
                window.location.replace("/dashboard");
                return;
            }

            discotron.Guild.getAll().then((guilds) => {
                this._guild = guilds[this._discordGuildId];
                if (this._guild === undefined) {
                    window.location.replace("/dashboard");
                }

                this._displayHeader();
                this._displayPlugins();
            }).catch(console.error);
        });
    }

    /**
     * Displays the image of the guild and its name
     */
    _displayHeader() {
        document.getElementById("header-icon").src = this._guild.iconURL;
        document.getElementById("guild-name").textContent = this._guild.name;
        document.getElementById("go-back").href += this._guild.discordId;
    }

    /**
     * Display plugins
     */
    _displayPlugins() {
        // Custom switches

        // Query cards
        discotron.Plugin.getAll().then((plugins) => {

            for (const pluginId in plugins) {
                const plugin = plugins[pluginId];

                const template = document.getElementById("template-card");
                const card = document.importNode(template.content, true);

                card.querySelector(".repository-card-title").textContent = plugin.name;
                card.querySelector(".repository-card-description").textContent = plugin.description;

                card.querySelector(".repository-card").onclick = () => {
                    const userRoles = this._guild.getPluginPermission(pluginId)._usersRoles;

                    new discotron.UserRoleWidgetController(this._guild, userRoles, (userRoles, settings) => {
                        this._guild.setPluginEnabled(pluginId, settings.enabled);
                        this._guild.setPluginPermission(pluginId, userRoles);
                    }, true, "Plugin settings: " + plugin.name, true, [{
                        type: "switch",
                        name: "Enabled",
                        value: this._guild.enabledPlugins.has(pluginId) || this._guild.enabledPlugins.size === 0,
                        devName: "enabled"
                    }]);
                };

                document.getElementById("plugin-container").appendChild(card);
            }
        }).catch(console.error);
    }
};
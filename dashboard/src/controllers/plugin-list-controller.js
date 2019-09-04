window.Discotron.PluginListController = class extends window.Discotron.Controller {
	/**
	 * Ctor
	 * @param {object} args Args given by the user in the URL
	 */
	constructor(args) {
		super("admin/plugin-list.html", () => {
			this._guildId = args.guild;

			if (this._guildId === undefined) {
				window.location.replace("/dashboard");
				return;
			}

			Discotron.Guild.getAll().then((guilds) => {
				this._guild = guilds[this._guildId];
				if (this._guild === undefined) {
					window.location.replace("/dashboard");
				}

				this._displayHeader();
				this._displayPlugins();
			});
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
	 * @param {Plugin} plugin Plugin
	 */
	_displayPlugins() {
		// Custom switches

		// Query cards
		Discotron.Plugin.getAll().then((plugins) => {

			for (let pluginId in plugins) {
				const plugin = plugins[pluginId];

				let template = document.getElementById("template-card");
				let card = document.importNode(template.content, true);

				card.querySelector(".repository-card-title").textContent = plugin.name;
				card.querySelector(".repository-card-description").textContent = plugin.description;

				card.querySelector(".repository-card").onclick = () => {
					let userRoles = this._guild.getPluginPermission(pluginId)._usersRoles;
					
					new Discotron.UserRoleWidgetController(this._guild, userRoles, (userRoles, settings) => {
						this._guild.setPluginEnabled(pluginId, settings.enabled);
						this._guild.setPluginPermission(pluginId, userRoles);
					}, true, "Plugin settings: " + plugin.name, true, [
						{type: "switch", name: "Enabled", value: this._guild.enabledPlugins.has(pluginId) || this._guild.enabledPlugins.size === 0, devname: "enabled"}
					]);
				};

				document.getElementById("plugin-container").appendChild(card);
			}
		});
	}
};
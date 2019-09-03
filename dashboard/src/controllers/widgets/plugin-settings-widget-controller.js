window.Discotron.PluginSettingsWidgetController = class extends window.Discotron.WidgetController {
	/**
	 * Ctor
	 * @param {Plugin} plugin Plugin this page is dedicated to 
	 * @param {function} onPluginSettingsSave Callback to be called when the user is done changing the settings
	 * @param {function} onClose Callback to be called when the widget is closed
	 */
	constructor(plugin, onPluginSettingsSave, onClose = () => {}) {
		super("plugin-settings.html", () => {
			onPluginSettingsSave(this._getPluginSettings());
		}, () => {

			this._plugin = plugin;
			this._displaySettings();
		}, onClose);
	}

	/**
	 * 
	 */
	_getPluginSettings() {
		return {
			enabled: this._widgetContainer.querySelector(".enabled-checkbox").checked,
			globalPrefix: this._widgetContainer.querySelector(".global-prefix").value
		};
	}

	/**
	 * Display a form allowing to change plugin settings
	 */
	_displaySettings() {
		this._widgetContainer.querySelector(".enabled-checkbox").checked = this._plugin.enabled;
		this._widgetContainer.querySelector(".logs").value = this._plugin.logs.join("\r\n");
		this._widgetContainer.querySelector(".global-prefix").value = this._plugin.prefix;

	}

	/**
	 * Something we won't have the time to implement I call it.
	 * Reload stuff from the webAPI and refresh display
	 */
	_onRefreshClick() {

	}
};
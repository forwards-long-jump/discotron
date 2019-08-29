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
		}, onClose);

		this._plugin = plugin;

		this._addEvents();
		this._displaySettings();
	}

	/**
	 * 
	 */
	_getPluginSettings() {

	}

	/**
	 * Add events to the page elements
	 */
	_addEvents() {

	}

	/**
	 * Display a form allowing to change plugin settings
	 */
	_displaySettings() {
		
	}

	/**
	 * Display a form allowing to change plugin settings
	 */
	_displayLogs() {
		
	}

	/**
	 * Something we won't have the time to implement I call it.
	 * Reload stuff from the webAPI and refresh display
	 */
	_onRefreshClick() {

	}
};
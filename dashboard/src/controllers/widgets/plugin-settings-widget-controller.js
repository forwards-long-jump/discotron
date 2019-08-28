window.Discotron.PluginSettingsWidgetController = class extends window.Discotron.WidgetController {

	constructor(pluginId, onPluginSettingsSave, onClose = () => {}) {
		super("plugin-settings.html", () => {
			onPluginSettingsSave(this._getPluginSettings());
		}, onClose);

		this._pluginId = pluginId;

		this._addEvents();
		this._displaySettings();
	}

	_getPluginSettings() {

	}

	_addEvents() {

	}

	_displaySettings() {

	}

	_onRefreshClick() {

	}
};
/**
 * Widget to change plugin settings
 */
window.discotron.PluginSettingsWidgetController = class extends window.discotron.WidgetController {
    /**
     * @class
     * @param {Plugin} plugin Plugin this page is dedicated to 
     * @param {Function} onPluginSettingsSave Callback to be called when the user is done changing the settings
     * @param {Function} [onClose=()=>{}] Callback to be called when the widget is closed
     */
    constructor(plugin, onPluginSettingsSave, onClose = () => { }) {
        super("plugin-settings.html", () => {
            onPluginSettingsSave(this._getPluginSettings());
        }, () => {

            this._plugin = plugin;
            this._displaySettings();
        }, onClose);
    }

    /**
     * @returns {object} {enabled, globalPrefix} get plugin settings set by the user
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
        this._widgetContainer.querySelector(".plugin-name").textContent = this._plugin.name;
        this._widgetContainer.querySelector(".plugin-version").textContent = this._plugin.version;
        this._widgetContainer.querySelector(".enabled-checkbox").checked = this._plugin.enabled;
        this._widgetContainer.querySelector(".logs").value = this._plugin.logs.join("\r\n");
        this._widgetContainer.querySelector(".global-prefix").value = this._plugin.prefix;

        this._widgetContainer.querySelector(".refresh-logs").onclick = () => {
            discotron.WebAPI.queryBot("discotron-dashboard", "get-plugin-logs", {
                pluginId: this._plugin.id
            }).then((logs) => {
                this._plugin.logs = logs;
                this._widgetContainer.querySelector(".logs").value = this._plugin.logs.join("\r\n");
            }).catch(console.error);
        };
    }

    /**
     * Something we won't have the time to implement I call it.
     * Reload stuff from the webAPI and refresh display
     */
    _onRefreshClick() {

    }
};
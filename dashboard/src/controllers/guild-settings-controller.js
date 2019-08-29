window.Discotron.GuildSettingsController = class extends window.Discotron.Controller {
    /**
     * Ctor
     * @param {Guild} guild Guild whose settings we must display
     */
    constructor(guild) {
        this._guild = guild;
    }

    /**
     * Displays the form entry concerning the plugin prefix
     */
    _displayPrefix() {

    }

    /**
     * Display channel selector widget
     */
    _onAllowedChannelsClick() {
        //new Widgetmachin(channels, currentlyselectedChan, (lel) => {currentlyselectedChan = lel;} 
    }

    /**
     * Display userRole widget 
     */
    _onAdminsClick() {

    }

    /**
     * Callback to give to the channel selector widget
     */
    _onAllowedChannelsWidgetSave() {

    }

    /**
     * Callback to give to the user / role selector widget
     */
    _onAdminsWidgetSave() {

    }
};
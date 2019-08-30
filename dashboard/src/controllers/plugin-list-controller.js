window.Discotron.PluginListController = class extends window.Discotron.Controller {
    /**
     * Ctor
     * @param {object} args Args given by the user in the URL
     */
	constructor(args) {
		super("admin/plugin-list.html");
		this._guild = args._guild;
		if (this._guild === undefined) {
			//TODO: redirect
		}
	}

	/**
	 * Add a plugin card, containing a checkbox for enabling, and a permission setting
	 * @param {Plugin} plugin Plugin
	 */
	_displayPluginCard(plugin) {

	}

	/**
	 * Display user/role selector
	 */
	_onPluginPermissionClick() {

	}

	/**
	 * Handle plugin enabling
	 */
	_onPluginEnabledClick() {

	}

};
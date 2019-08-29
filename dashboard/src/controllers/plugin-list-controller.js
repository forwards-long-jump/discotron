window.Discotron.PluginListController = class extends window.Discotron.Controller {
	/**
	 * Ctor 
	 * @param {Guild} guild Guild whose plugin settings we display
	 */
	constructor(guild) {
		this._loadPage("admin/plugin-list.html");
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
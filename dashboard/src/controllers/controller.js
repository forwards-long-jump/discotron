window.Discotron.Controller = class {
	/**
	 * Parse URL and call the right specificController.loadPage()
	 */
	static route() {
		
	}

	/**
	 * Find which controller is to be called
	 */
	static _parseURL(url) {
		// Check if on correct page and split # 
	}

	static _addEvents() {
		// Intercept URL change
		// Detect if it's still our domain and /dashboard
		// if previous url is not the same, push to history
		// route()
	}

	/**
	 * Load specified html page
	 * @param {string} pageName Name of the page
	 */
	static loadPage(pageName) {
		// Get html file and put it into <main>
	}
};

window.Discotron.Controller._controllers = {
	//pluginList: window.Discotron.PluginListController
};
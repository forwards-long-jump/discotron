window.Discotron.Controller = class {
	/**
	 * Ctor
	 */
	constructor(pageName, callback) {
		Discotron.Controller._loadPage(pageName, callback);
	}

	/**
	 * Load specified html page
	 * @param {string} pageName Name of the page
	 */
	static _loadPage(pageName, callback) {
		// Get html file and put it into <main>
		const baseURL = "/dashboard/src/views/";
		Discotron.utils.load(baseURL + pageName, document.querySelector("main"), callback);
	}
};
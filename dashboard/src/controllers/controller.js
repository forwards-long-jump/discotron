/**
 * Each page is associated with a controller that extends this one
 */
window.Discotron.Controller = class {
	/**
	 * @constructor
	 * @param {string} pageName Html file name that will be loaded
	 * @param {function} callback Function called when the page is loaded
	 */
	constructor(pageName, callback) {
		Discotron.Controller._loadPage(pageName, callback);
	}

	/**
	 * Load specified html page
	 * @static
	 * @param {string} pageName Name of the page
	 * @param {function} callback Function called when the page is loaded
	 */
	static _loadPage(pageName, callback) {
		// Get html file and put it into <main>
		const baseURL = "/dashboard/src/views/";
		Discotron.utils.load(baseURL + pageName, document.querySelector("main"), callback);
	}
};
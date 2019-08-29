window.Discotron.Controller = class {

	/**
	 * Load specified html page
	 * @param {string} pageName Name of the page
	 */
	static _loadPage(pageName) {
		// Get html file and put it into <main>
		const baseURL = "/dashboard/src/views/";
		Discotron.utils.load(baseURL + pageName, document.querySelector("main"));
	}
};

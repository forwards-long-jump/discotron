/**
 * Each page is associated with a controller that extends this one
 */
window.discotron.Controller = class {
    /**
     * @class
     * @param {string} pageName Html file name that will be loaded
     * @param {Function} callback Function called when the page is loaded
     */
    constructor(pageName, callback) {
        discotron.Controller._loadPage(pageName, callback);
    }

    /**
     * Load specified html page
     * @static
     * @param {string} pageName Name of the page
     * @param {Function} callback Function called when the page is loaded
     */
    static _loadPage(pageName, callback) {
        // Get html file and put it into <main>
        const baseURL = "/dashboard/views/pages/";
        discotron.utils.load(baseURL + pageName, document.querySelector("main"), callback);
    }
};
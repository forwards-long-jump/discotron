/**
 * Represents a repository containing plugins
 */
class RepositoryModel {
    /**
     * @class
     * @param {string} url Url of the repository
     * @param {Array} pluginIds List of plugin ids
     * @param {Array} pages List of pages route exposed by the plugin
     */
    constructor(url = "", pluginIds = [], pages = []) {
        this._url = url;
        this._pluginIds = pluginIds;
        this._pages = pages;
    }

    /**
     * @returns {string} Repository url
     */
    get url() {
        return this._url;
    }

    /**
     * @returns {Array} Array of string
     */
    get pluginIds() {
        return this._pluginIds;
    }

    /**
     * @returns {Array} Array of string
     */
    get pages() {
        return this._pages;
    }
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = RepositoryModel;
} else {
    window.discotron.RepositoryModel = RepositoryModel;
}
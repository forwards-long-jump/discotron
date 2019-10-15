/**
 * Represents a repository containing plugins
 */
class RepositoryModel {
    /**
     * Ctor
     * @param {string} url Url of the repository
     * @param {array} pluginIds List of plugin ids
     * @param {array} pages List of pages route exposed by the plugin
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
     * @returns {array} Array of string
     */
    get pluginIds() {
        return this._pluginIds;
    }

    /**
     * @returns {array} Array of string
     */
    get pages() {
        return this._pages;
    }
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = RepositoryModel;
} else {
    window.Discotron.RepositoryModel = RepositoryModel;
}
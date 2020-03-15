/**
 * Represents a repository containing plugins
 */
class RepositoryModel {
    /**
     * @class
     * @param {object} options Args
     * @param {string} options.url Url of the repository
     * @param {Array} options.pluginIds List of plugin ids
     * @param {Array} options.pages List of pages route exposed by the plugin
     */
    constructor({url = "", pluginIds = [], pages = []} = {}) {
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
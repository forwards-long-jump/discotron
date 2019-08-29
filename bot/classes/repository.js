const RepositoryModel = require(__dirname + "/../models/repository.js");

class Repository extends RepositoryModel {
    /**
     * Ctor
     * @param {string} folderName 
     * @param {string} url 
     */
    constructor(folderName, url) {
        super(url);
        this._folderName = folderName;

        Repository._repositories.push(this);
    }

    /**
     * Returns all the repositories
     * @returns {array} Repositories
     */
    static getAll() {
        return Repository._repositories;
    }

    /**
     * Clone a repository from a url, should be used the first time
     * @param {string} url 
     * @returns {string} Folder name of the downloaded repo
     */
    static clone(url) {

    }

    /**
     * Pull from the distant repository, to update the plugins
     */
    pull() {

    }

    /**
     * Delete the repository locally and remove it from database
     */
    delete() {
        this._deleteFolder();
        // Do not forget to unregister from Repository._repositories
    }

    /**
     * @returns {object} Object containing {url, pluginIds, pages, status}
     */
    toObject() {

    }

    /**
     * @returns {number} Number of commits behind
     */
    getStatus() {

    }

    /**
     * Delete the folder
     */
    _deleteFolder() {

    }
}

Repository.prototype._repositories = [];

module.exports = Repository;
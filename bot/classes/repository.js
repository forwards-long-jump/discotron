const fs = require("fs");

const RepositoryModel = require("./../../models/repository.js");
const Plugin = require("./plugin.js");
const webAPI = require("./../apis/web-api.js").getWebAPI("discotron-dashboard");
const Logger = require("../utils/logger.js");

class Repository extends RepositoryModel {
    /**
     * Ctor
     * @param {string} folderName 
     * @param {string} url 
     */
    constructor(folderName, url) {
        super(url);
        this._folderName = folderName;

        let pluginsPath = __dirname + "/../repositories/" + folderName + "/plugins";
        let pagesPath = __dirname + "/../repositories/" + folderName + "/pages";
        let noPlugins = true;

        if (fs.existsSync(pluginsPath)) {
            noPlugins = false;
            fs.readdirSync(__dirname + "/../repositories/" + folderName + "/plugins").forEach(file => {
                let plugin = new Plugin(pluginsPath + "/" + file);
                this._pluginIds.push(plugin.id);
            });
        }

        if (fs.existsSync(pagesPath)) {
            fs.readdirSync(__dirname + "/../repositories/" + folderName + "/pages").forEach(file => {
                // serve page (lel)
            });

            if (noPlugins) {
                Logger.log("No **plugins** or **pages** folders found for repository stored in **" + folderName + "**!", "warn");
            }
        }

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

    static registerActions() {
        webAPI.registerAction("get-repositories", (data, reply) => {}, "owner");
        webAPI.registerAction("add-repository", (data, reply) => {}, "owner");
        webAPI.registerAction("remove-repository", (data, reply) => {}, "owner");
        webAPI.registerAction("update-repository", (data, reply) => {}, "owner");
    }
}

Repository._repositories = [];

module.exports = Repository;
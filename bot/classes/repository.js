const fs = require("fs");

const RepositoryModel = require("./../../models/repository.js");
const Plugin = require("./plugin.js");
const webAPI = require("./../apis/web-api.js").getWebAPI("discotron-dashboard");
const Logger = require("../utils/logger.js");
const Git = require("nodegit");
const crypto = require("crypto");

const db = require("../apis/database-crud.js");

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
     * @returns {Promise} Folder name of the downloaded repo
     */
    static clone(url) {
        return new Promise((resolve, reject) => {
            let folderName = Repository._generateFolderName(url);
            Git.Clone(url, __dirname + "/../repositories/" + folderName, {
                checkoutBranch: "master"
            }).then((repo) => {
                db.insert("Repositories", {
                    repositoryURL: url,
                    folderName: folderName
                });

                // Load itself
                new Repository(folderName, url);
                resolve(folderName);
            }).catch((e) => {
                reject(e);
            });
        });
    }

    /**
     * Returns a folder name from a git url
     * @param {string} url 
     */
    static _generateFolderName(url) {
        url = url.replace(/\.git/g, "");
        url = url.split("/");
        url = url[url.length - 1];
        url = url.replace(/[^a-zA-Z0-9\-]/g, "");
        return url + crypto.createHash("md5").update(url).digest("hex"); // Should rather check if folder exists but we should not have collisions for that
    }

    /**
     * Pull from the distant repository, to update the plugins
     */
    pull() {    
        let repo;
        // Source: https://stackoverflow.com/questions/20955393/nodegit-libgit2-for-node-js-how-to-push-and-pull
        Git.Repository.open(__dirname + "/../repositories/" + this._folderName)
            .then(function (repository) {
                repo = repository;
                return repository.fetch("origin");
            })
            .then(function () {
                return repo.mergeBranches("master", "origin/master");
            })
            .then(function (oid) {
                // cb(null, oid);
            }).catch((err) => {
                console.log(err);
            });
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
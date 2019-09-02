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

        this.loadPluginsFromDisk();
        this.loadPagesFromDisk();

        if (this._pluginIds.length === 0 && this._pages.length === 0) {
            Logger.log("No **plugins** or **pages** folders found for repository stored in **" + folderName + "**!", "warn");
        }

        Repository._repositories.push(this);
    }

    loadPluginsFromDisk() {
        let pluginsPath = __dirname + "/../repositories/" + this._folderName + "/plugins";

        // TODO: Convert to async
        if (fs.existsSync(pluginsPath)) {
            fs.readdirSync(__dirname + "/../repositories/" + this._folderName + "/plugins").forEach(file => {
                Logger.log("Building Plugin from folder **" + file + "**", "debug");
                let plugin = new Plugin(pluginsPath + "/" + file);
                this._pluginIds.push(plugin.id);
            });
        }

    }

    loadPagesFromDisk() {
        let pagesPath = __dirname + "/../repositories/" + this._folderName + "/pages";

        // TODO: Convert to async
        if (fs.existsSync(pagesPath)) {
            fs.readdirSync(__dirname + "/../repositories/" + folderName + "/pages").forEach(file => {
                // serve page (lel)
            });
        }

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
        Logger.log("Cloning **" + url + "**...");
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
        Logger.log("Updating **" + this._folderName + "**...");
        let repo;
        // Source: https://stackoverflow.com/questions/20955393/nodegit-libgit2-for-node-js-how-to-push-and-pull
        Git.Repository.open(__dirname + "/../repositories/" + this._folderName)
            .then((repository) => {
                repo = repository;
                return repository.fetch("origin");
            })
            .then(() => {
                return repo.mergeBranches("master", "origin/master");
            })
            .then((oid) => {
                let oldPluginList = this._pluginIds.splice(0);
                this.loadPluginsFromDisk();
                this.loadPagesFromDisk();

                let deletedPlugins = [];

                for (let i = 0; i < oldPluginList.length; i++) {
                    const oldPluginId = oldPluginList[i];

                    if (!this._pluginIds.includes(oldPluginId)) {
                        deletedPlugins.push(oldPluginId);
                    }
                }

                for (let i = 0; i < deletedPlugins.length; i++) {
                    Plugin.getAll()[deletedPlugins[i]].delete();
                }
            }).catch((err) => {
                console.log(err);
            });
    }

    /**
     * Delete the repository locally and remove it from database
     */
    delete() {
        for (let i = 0; i < Repository._repositories.length; ++i) {
            if (Repository._repositories[i] === this) {
                delete Repository._repositories[i];
                break;
            }
        }

        db.delete("Repositories", this._folderName);

        let plugins = Plugin.getAll();
        for (let i = 0; i < this._pluginIds.length; ++i) {
            plugins[this._pluginIds[i]].delete();
        }
        this._deleteFolder();
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
        webAPI.registerAction("get-repositories", (data, reply) => {
            reply(Repository.getAll().map((repo) => {
                return repo.toObject();
            }));
        }, "owner");
        webAPI.registerAction("add-repository", (data, reply) => {
            Repository.clone(data.url);
            reply();
        }, "owner");
        webAPI.registerAction("remove-repository", (data, reply) => {
            for (let i = 0; i < Repository._repositories.length; ++i) {
                let repo = Repository._repositories[i];
                if (repo.url === data.url) {
                    repo.delete();
                }
            }
            reply();
        }, "owner");
        webAPI.registerAction("update-repository", (data, reply) => {
            for (let i = 0; i < Repository._repositories.length; ++i) {
                let repo = Repository._repositories[i];
                if (repo.url === data.url) {
                    repo.pull();
                }
            }
            reply();
        }, "owner");
    }
}

Repository._repositories = [];

module.exports = Repository;
const fs = require("fs");

const RepositoryModel = require("./../../shared-models/repository.js");
const Plugin = require("./plugin.js");
const webAPI = require("../../dashboard/backend/api.js").getWebAPI("discotron-dashboard");
const webServer = require("../../dashboard/backend/webserver.js");
const Logger = require("../utils/logger.js");
const fileHelper = require("../utils/file-helper.js");
const Git = require("nodegit");

const db = require("../database/crud.js");

/**
 * Repository server side, contains plugins and pages
 */
class Repository extends RepositoryModel {
    /**
     * @class
     * @param {string} folderName Name of the folder for this repository
     * @param {string} url URL to use to clone a repository
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

    /**
     * Load all plugins existing in this repository
     */
    loadPluginsFromDisk() {
        const pluginsPath = global.discotronConfigPath + "/repositories/" + this._folderName + "/plugins";

        if (fs.existsSync(pluginsPath)) {
            fs.readdirSync(global.discotronConfigPath + "/repositories/" + this._folderName + "/plugins").forEach(file => {
                Logger.log("Building Plugin from folder **" + file + "**", "debug");
                const plugin = new Plugin(pluginsPath + "/" + file);
                this._pluginIds.push(plugin.id);
            });
        }

    }

    /**
     * Load all pages existing in this repository
     */
    loadPagesFromDisk() {
        const pagesPath = global.discotronConfigPath + "/repositories/" + this._folderName + "/pages";

        if (fs.existsSync(pagesPath)) {
            fs.readdirSync(global.discotronConfigPath + "/repositories/" + this._folderName + "/pages").forEach(file => {
                Logger.log("Serving web folder **" + file + "**");
                webServer.serveRepositoryFolder(file, this._folderName);

                const oldPageIndex = this._pages.indexOf(file);
                if (oldPageIndex >= 0) {
                    this._pages.splice(oldPageIndex, 1);
                }
                this._pages.push(file);
            });
        }
    }

    /**
     * @returns {Array} Array of all repositories
     * @static
     */
    static getAll() {
        return Repository._repositories;
    }

    /**
     * Clone a repository from a url, should be used the first time
     * @param {string} url Repository URL to clone
     * @static
     * @returns {Promise<string>} Folder name of the repository
     */
    static async clone(url) {
        Logger.log("Cloning **" + url + "**...");

        let folderName;
        let foundRepos;
        try {
            // Verify that the database does not already contain this repository
            // We can assume that the generated folder name is a plugin's unique id
            folderName = Repository._generateFolderName(url);
            foundRepos = await db.select("Repositories", ["folderName"], {folderName: folderName});
        } catch (err) {
            Logger.log("Cloning failed!", "err");
            Logger.log(err, "err");
            throw new Error("Unexpected error occured retrieving repository information.");
        }

        if (foundRepos.length > 0) {
            throw new Error("Attempted to clone a repository that is already loaded: " + folderName);
        }

        // Clone into path (must not exist)
        const repoPath = global.discotronConfigPath + "/repositories/" + folderName;
        if (fs.existsSync(repoPath)) {
            throw new Error("Attempted to clone into a folder that already exists: " + folderName);
        }

        try {
            await Git.Clone(url, repoPath, {
                checkoutBranch: "master"
            });

            // Insert into repo table
            await db.insert("Repositories", {
                repositoryURL: url,
                folderName: folderName
            });

            // Load itself
            new Repository(folderName, url);
            Logger.log("Cloning successful.");
            return folderName;
        } catch (err) {
            Logger.log("Cloning failed!", "err");
            Logger.log(err, "err");
            throw new Error("Unexpected error occured cloning repository.");
        }
    }

    /**
     * @param {string} baseUrl URL to convert
     * @static
     * @returns {string} a folder name from a git url
     */
    static _generateFolderName(baseUrl) {
        let url = baseUrl.replace(/\.git/g, "");
        url = url.split("/");
        url = url[url.length - 1];
        url = url.replace(/[^a-zA-Z0-9-_]/g, "");
        return url;
    }

    /**
     * Pull from the distant repository, update the plugins
     * @returns {Promise} resolve(), reject()
     */
    pull() {
        Logger.log("Updating **" + this._folderName + "**...");
        return new Promise((resolve, reject) => {
            let repo;
            // Source: https://stackoverflow.com/questions/20955393/nodegit-libgit2-for-node-js-how-to-push-and-pull
            Git.Repository.open(global.discotronConfigPath + "/repositories/" + this._folderName)
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

                    resolve();
                }).catch((err) => {
                    Logger.err(err);
                    reject();
                });
        });
    }

    /**
     * Delete the repository locally and remove it from database
     * @returns {Promise} resolve(), reject()
     */
    delete() {
        return new Promise((resolve, reject) => {
            let index = Repository._repositories.indexOf(this);
            if (index < 0) {
                return;
            }

            Repository._repositories.splice(index, 1);

            return db.delete("Repositories", {
                folderName: this._folderName
            }).then(() => {
                let plugins = Plugin.getAll();
                for (let i = 0; i < this._pluginIds.length; ++i) {
                    plugins[this._pluginIds[i]].delete();
                }

                this._deleteFolder(); // sync
                resolve();
            });
        });
    }

    /**
     * @returns {object} Object containing {url, pluginIds, pages, status}
     */
    toObject() {
        return {
            url: super.url,
            pluginIds: super.pluginIds,
            pages: super.pages,
            status: this.getStatus()
        };
    }

    /**
     * @returns {number} Number of commits behind
     */
    getStatus() {
        // TODO: Query git status and determine if we are behind
        return undefined;
    }

    /**
     * Delete the folder
     */
    _deleteFolder() {
        fileHelper.deleteFolder(global.discotronConfigPath + "/repositories/" + this._folderName);
    }

    /**
     * Register webAPI actions related to a repository
     * @static
     */
    static registerActions() {
        webAPI.registerAction("get-repositories", (data, reply) => {
            reply(Repository.getAll().map((repo) => {
                return repo.toObject();
            }));
        }, "owner");

        webAPI.registerAction("add-repository", (data, reply) => {
            Repository.clone(data.url).then(() => reply()).catch((err) => reply(err.message));
        }, "owner");

        webAPI.registerAction("remove-repository", (data, reply) => {
            for (let i = 0; i < Repository._repositories.length; ++i) {
                const repo = Repository._repositories[i];
                if (repo.url === data.url) {
                    repo.delete().then(() => {
                        reply(true);
                    }).catch(Logger.err);
                    return;
                }
            }

            reply(false);
        }, "owner");

        webAPI.registerAction("update-repository", (data, reply) => {
            for (let i = 0; i < Repository._repositories.length; ++i) {
                const repo = Repository._repositories[i];
                if (repo.url === data.url) {
                    repo.pull().then(() => {
                        reply(true);
                    }).catch(() => {
                        reply(false);
                    });
                    return;
                }
            }
            reply(false);
        }, "owner");
    }
}

Repository._repositories = [];

module.exports = Repository;

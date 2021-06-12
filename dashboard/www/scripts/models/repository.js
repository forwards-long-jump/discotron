/**
 * Represents a repository, dashboard side
 */
window.discotron.Repository = class extends window.discotron.RepositoryModel {
    /**
     * @class
     * @param {object} options Args
     * @param {string} options.url URL of the repository
     * @param {Array} options.pluginIds Array of plugin ids
     * @param {Array} options.pages Array of page names
     */
    constructor({url, pluginIds, pages}) {
        // get info from db
        super({url, pluginIds, pages});
    }

    /**
     * Creates and registers a new repository.
     * @param {object} options Args
     * @param {string} options.url URL of the repository
     * @param {Array} options.pluginIds Array of plugin ids
     * @param {Array} options.pages Array of page names
     * @returns {object} New repository instance
     */
    static create(options) {
        const repo = new discotron.Repository(options);
        discotron.Repository._repositories.push(repo);
        return repo;
    }

    /**
     * @static
     * @returns {Array} Array of Repository
     */
    static getAll() {
        return new Promise((resolve, reject) => {
            if (discotron.Repository._repositories.length === 0) {
                return discotron.WebAPI.queryBot("discotron-dashboard", "get-repositories").then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        const repository = data[i];
                        discotron.Repository.create({
                            url: repository.url,
                            pluginIds: repository.pluginIds,
                            pages: repository.pages
                        });
                    }
                    resolve(discotron.Repository._repositories);
                });
            } else {
                resolve(discotron.Repository._repositories);
            }
        });
    }

    /**
     * Clear the cache, forcing to reload repository next time they are accessed
     * @static
     */
    static clearCache() {
        discotron.Repository._repositories = [];
    }
};

discotron.Repository._repositories = [];
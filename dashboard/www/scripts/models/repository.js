/**
 * Represents a repository, dashboard side
 */
window.discotron.Repository = class extends window.discotron.RepositoryModel {
    /**
     * @class
     * @param {string} url URL of the repository
     * @param {Array} pluginIds Array of plugin ids
     * @param {Array} pages Array of page names
     */
    constructor(url, pluginIds, pages) {
        // get info from db
        super(url, pluginIds, pages);
        discotron.Repository._repositories.push(this);
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
                        new discotron.Repository(repository.url, repository.pluginIds, repository.pages);
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
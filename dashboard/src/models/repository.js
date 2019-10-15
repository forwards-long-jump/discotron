/**
 * Represents a repository, dashboard side
 */
window.Discotron.Repository = class extends window.Discotron.RepositoryModel {
    /**
     * @constructor
     * @param {string} url URL of the repository
     */
    constructor(url, pluginIds, pages) {
        // get info from db
        super(url, pluginIds, pages);
        Discotron.Repository._repositories.push(this);
    }

    /**
     * @static
     * @returns {array} Array of Repository
     */
    static getAll() {
        return new Promise((resolve, reject) => {
            if (Discotron.Repository._repositories.length === 0) {
                Discotron.WebAPI.queryBot("discotron-dashboard", "get-repositories").then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        const repository = data[i];
                        new Discotron.Repository(repository.url, repository.pluginIds, repository.pages);
                    }
                    resolve(Discotron.Repository._repositories);
                });
            } else {
                resolve(Discotron.Repository._repositories);
            }
        }).catch(console.error);
    }

    /**
     * Clear the cache, forcing to reload repository next time they are accessed
     * @static
     */
    static clearCache() {
        Discotron.Repository._repositories = [];
    }
};

Discotron.Repository._repositories = [];
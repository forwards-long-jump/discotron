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
        discotron.Repository._repositories.push(this);
    }

    /**
     * @static
     * @returns {Array} Array of Repository
     */
    static async getAll() {
        // TODO: Use WebAPI cache (which must be invalidated OR updated when we create a new repository!)
        if (discotron.Repository._repositories.length === 0) {
            const data = await discotron.WebApi.get("repository");
            for (let i = 0; i < data.length; i++) {
                const repository = data[i];
                new discotron.Repository({
                    url: repository.url,
                    pluginIds: repository.pluginIds,
                    pages: repository.pages
                });
            }
        }

        return discotron.Repository._repositories;
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

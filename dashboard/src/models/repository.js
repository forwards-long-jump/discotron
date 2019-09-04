window.Discotron.Repository = class extends window.Discotron.RepositoryModel {
    /**
     * Ctor
     * @param {string} url URL of the repository
     */
    constructor(url, pluginIds, pages) {
        // get info from db
        super(url, pluginIds, pages);
        Discotron.Repository._repositories.push(this);
    }

    /**
     * Return the repositories added to the bot
     * @returns {array} Array of Repositories
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
        });
    }

    /**
     * Reload the repositories
     */
    static clearCache() {
        Discotron.Repository._repositories = [];
    }

    /**
     * Try to add a repo, may fail
     * @returns {Promise}
     */
    static add(url) {
        // Query API to tryAdd a repository
    }

    /**
     * Remove the repository from the bot, and queries the API to delete it from the database
     */
    delete() {
        // Query API to delete repo, this will trigger sadness in the dashboard too
    }
};

Discotron.Repository._repositories = [];
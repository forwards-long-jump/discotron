window.Discotron.Repository = class extends window.Discotron.RepositoryModel {
    /**
     * Ctor
     * @param {string} url URL of the repository
     */
    constructor(url) {
        // get info from db
        super(url /*, ...*/ );
        window.Discotron.Repository._repositories.push(this);
    }

    /**
     * Return the repositories added to the bot
     * @returns {array} Array of Repositories
     */
    static getAll() {
        return window.Discotron.Repository._repositories;
    }

    /**
     * Reload the repositories
     */
    static reload() {
        window.Discotron.Repository._repositories = [];
        // build all repos
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

window.Discotron.Repository.prototype._repositories = [];
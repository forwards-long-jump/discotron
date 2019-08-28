window.Discotron.Repository = class extends window.Discotron.RepositoryModel {
    constructor(url) {
        // get info from db
        super(url /*, ...*/ );
        Repository._repositories.push(this);
    }

    static getAll() {
        return Repository._repositories;
    }

    static reload() {
        Repository._repositories = [];
        // build all repos
    }

    delete() {

    }
};

window.Discotron.Repository.prototype._repositories = [];
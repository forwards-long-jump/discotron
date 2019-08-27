class Repository extends RepositoryModel {
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
}

Repository.prototype._repositories = [];
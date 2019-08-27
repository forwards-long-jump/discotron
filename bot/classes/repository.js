class Repository extends RepositoryModel {
    constructor(folderName, url) {
        super(url);
        this._folderName = folderName;
    }

    static clone(url) {

    }

    pull() {

    }

    delete() {

    }

    _deleteFolder() {

    }
}

module.exports = Repository;
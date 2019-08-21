class Repository {
    constructor(url, plugins = [], pages = []) {
        this._url = url;
        this._plugins = plugins;
        this._pages = pages;
        // TODO: fill arrays
    }
}

module.exports = Repository;
const Repository = require("../../../core/models/repository.js");
const Logger = require("../../../core/utils/logger.js");
const WebApiError = require("../../../shared/webapi-error.js");

module.exports.get = {
    authentication: "owner",
    action: () => {
        return Repository.getAll().map((repo) => repo.toObject());
    }
};

module.exports.post = {
    authentication: "owner",
    action: async (userData) => {
        if (!userData.url) {
            throw new WebApiError("Can't create repository without specifying a URL to clone from.", "missing-url");
        }

        try {
            await Repository.clone(userData.url);
        } catch (err) {
            // TODO: Can we safely re-throw all errors? Can they contain some confidential data in the message?
            Logger.debug("Error cloning repository", userData.url, err);
            throw new WebApiError(err.message, "clone-error");
        }
    }
};

module.exports.delete = {
    authentication: "owner",
    action: async (userData) => {
        if (!userData.url) {
            throw new WebApiError("Can't delete repository without specifying a URL.", "missing-url");
        }

        for (let i = 0; i < Repository._repositories.length; ++i) {
            const repo = Repository._repositories[i];
            if (repo.url === userData.url) {
                try {
                    await repo.delete();
                    return;
                } catch (err) {
                    Logger.debug("Error deleting repository", userData.url, err);
                    throw new WebApiError("Failed deleting repository!", "delete-error");
                }
            }
        }

        throw new WebApiError("Repository with the specified URL was not found.", "not-found");
    }
};

module.exports.put = {
    authentication: "owner",
    action: async (userData) => {
        if (!userData.url) {
            throw new WebApiError("Can't update repository without specifying a URL.", "missing-url");
        }

        for (let i = 0; i < Repository._repositories.length; ++i) {
            const repo = Repository._repositories[i];
            if (repo.url === userData.url) {
                try {
                    await repo.pull();
                    return;
                } catch (err) {
                    Logger.debug("Error pulling repository", userData.url, err);
                    throw new WebApiError("Failed updating repository!", "pull-error");
                }
            }
        }

        throw new WebApiError("Repository with the specified URL was not found.", "not-found");
    }
};

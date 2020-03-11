const webAPI = require("../api.js").getWebAPI("discotron-dashboard");
const Repository = require("../../../core/models/repository.js");
const Logger = require("../../../core/utils/logger.js");

webAPI.registerAction("get-repositories", (data, reply) => {
    reply(Repository.getAll().map((repo) => {
        return repo.toObject();
    }));
}, "owner");

webAPI.registerAction("add-repository", (data, reply) => {
    Repository.clone(data.url).then(() => reply()).catch((err) => reply(err.message));
}, "owner");

webAPI.registerAction("remove-repository", (data, reply) => {
    for (let i = 0; i < Repository._repositories.length; ++i) {
        const repo = Repository._repositories[i];
        if (repo.url === data.url) {
            repo.delete().then(() => {
                reply(true);
            }).catch(Logger.err);
            return;
        }
    }

    reply(false);
}, "owner");

webAPI.registerAction("update-repository", (data, reply) => {
    for (let i = 0; i < Repository._repositories.length; ++i) {
        const repo = Repository._repositories[i];
        if (repo.url === data.url) {
            repo.pull().then(() => {
                reply(true);
            }).catch(() => {
                reply(false);
            });
            return;
        }
    }
    reply(false);
}, "owner");

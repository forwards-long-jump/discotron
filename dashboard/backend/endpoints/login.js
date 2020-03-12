const webAPI = require("../api.js").getWebAPI("discotron-dashboard");
const { handleLogin, claimOwnership } = require("../../../core/login.js");

webAPI.registerAction("claim-ownership", (data, reply) => {
    claimOwnership(data.code, reply, data.ownerSecret);
});

webAPI.registerAction("login", (data, reply) => {
    handleLogin(data.code, reply);
});
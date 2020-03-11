const webAPI = require("../api.js").getWebAPI("discotron-dashboard");
const Owner = require("../../../core/models/owner.js");

webAPI.registerAction("set-owners", (data, reply) => {
    Owner.setOwners(data.discordUserIds);
    reply();
}, "owner");

webAPI.registerAction("get-owner-ids", (data, reply) => {
    reply(Array.from(Owner._owners));
}, "owner");

webAPI.registerAction("is-owner", (data, reply, discordUserId) => {
    reply(Owner.isOwner(discordUserId));
});
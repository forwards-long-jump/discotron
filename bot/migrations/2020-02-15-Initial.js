module.exports.up = function() {
    return `
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

CREATE TABLE _Migrations (name TEXT NOT NULL, value TEXT, PRIMARY KEY(name));

CREATE TABLE Admins (discordGuildId TEXT NOT NULL REFERENCES Guilds (discordGuildId) ON DELETE CASCADE, userRoleId INTEGER NOT NULL REFERENCES UsersRoles (id) ON DELETE CASCADE, PRIMARY KEY (discordGuildId, userRoleId));

CREATE TABLE AllowedChannels (discordGuildId TEXT NOT NULL REFERENCES Guilds (discordGuildId) ON DELETE CASCADE, discordChannelId TEXT NOT NULL, PRIMARY KEY (discordGuildId, discordChannelId));

CREATE TABLE BotSettings (name TEXT NOT NULL, value TEXT, PRIMARY KEY(name));
INSERT INTO BotSettings (name, value) VALUES ('helpText', '');
INSERT INTO BotSettings (name, value) VALUES ('maintenance', 'false');
INSERT INTO BotSettings (name, value) VALUES ('presenceText', '');

CREATE TABLE GuildEnabledPlugins (pluginId TEXT NOT NULL REFERENCES Plugins (id) ON DELETE CASCADE, discordGuildId INTEGER NOT NULL REFERENCES Guilds (discordGuildId) ON DELETE CASCADE, PRIMARY KEY (pluginId, discordGuildId));

CREATE TABLE Guilds (discordGuildId TEXT PRIMARY KEY NOT NULL);

CREATE TABLE GuildSettings (discordGuildId TEXT NOT NULL REFERENCES Guilds (discordGuildId) ON DELETE CASCADE, prefix TEXT DEFAULT ('!') NOT NULL, PRIMARY KEY (discordGuildId));

CREATE TABLE Owners (discordUserId TEXT NOT NULL REFERENCES Users (discordUserId) ON DELETE CASCADE, PRIMARY KEY (discordUserId));

CREATE TABLE Permissions (discordGuildId TEXT NOT NULL REFERENCES Guilds (discordGuildId) ON DELETE CASCADE, pluginId TEXT NOT NULL REFERENCES Plugins (id) ON DELETE CASCADE, userRoleId INTEGER NOT NULL REFERENCES UsersRoles (id) ON DELETE CASCADE, PRIMARY KEY (discordGuildId, pluginId, userRoleId));

CREATE TABLE Plugins (id TEXT NOT NULL, prefix TEXT, disabled INTEGER DEFAULT (0) NOT NULL, PRIMARY KEY (id));

CREATE TABLE Repositories (repositoryURL TEXT NOT NULL UNIQUE, folderName TEXT NOT NULL, PRIMARY KEY(folderName));

CREATE TABLE Tokens (discordUserId TEXT NOT NULL REFERENCES Users (discordUserId) ON DELETE CASCADE, accessToken TEXT NOT NULL, refreshToken TEXT NOT NULL, appToken TEXT NOT NULL, expireDate INTEGER NOT NULL, PRIMARY KEY (discordUserId));

CREATE TABLE Users (discordUserId TEXT PRIMARY KEY NOT NULL);

CREATE TABLE UsersRoles (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, discordUserId TEXT REFERENCES Users (discordUserId) ON DELETE CASCADE, discordRoleId TEXT);

COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
`;
};
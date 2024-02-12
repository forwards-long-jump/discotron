/**
 * Init sequence of Discotron
 */
async function init() {
    const Logger = require("./core/utils/logger.js");
    Logger.setSeverity("info");

    const discordClientProvider = require("./core/utils/discord-client-provider.js");
    const parseArgs = require("minimist");

    global.discotronConfigPath = __dirname + "/instance";
    handleArgs(parseArgs(process.argv));

    let appConfig;
    loadConfig();

    const databaseHelper = require("./core/database/database.js");

    // Database
    // TODO: We need a config option to enforce a certain db version for testing older versions of the db
    const dbVersion = null;
    // TODO: We need a config option to define whether downgrading db versions is ok (this REMOVES DATA!)
    //  -> Maybe ask whether to automatically create a backup of the current database?
    const allowDown = false;
    databaseHelper.openDatabase();
    await databaseHelper.doDatabaseMigrations(dbVersion, allowDown);

    const webserver = require("./dashboard/backend/webserver.js");
    const discotron = require("./core/discotron.js");

    const discordClient = discordClientProvider.get({allowOffline: true});

    global.discotron = discotron;

    await discotron.loadGuilds();
    discotron.loadRepositories();

    require("./core/login.js").updateHasBotOwner();

    // Web server
    webserver.serveDashboard();

    // Must register discordClient events before login or we will miss some
    registerEvents();
    await connectToDiscord();

    /**
     * Attempts to connect the bot client to Discord
     * @returns {Promise<boolean>} true if login is successful, false otherwise
     * @async
     */
    async function connectToDiscord() {
        Logger.debug("Connecting to discord...");
        try {
            await discordClient.login(appConfig.token);
            return true;
        } catch (err) {
            Logger.err("Could not connect to discord:", err.message);
            return false;
        }
    }

    global.discotron._connectToDiscord = connectToDiscord;

    /**
     * Register Discord events and associate them to Discotron handlers
     */
    function registerEvents() {
        // TODO: Handle error and reaction

        discordClient.on("ready", () => {
            Logger.info("Logged into Discord as **" + discordClient.user.tag + "**");
            discotron.updateGuilds();
            discotron.getBotSettings().setBotPresence();
        });

        discordClient.on("message", discotron.onMessage);
        discordClient.on("messageReactionAdd", discotron.onReaction);
        discordClient.on("guildCreate", discotron.onJoinGuild);
        discordClient.on("guildDelete", discotron.onLeaveGuild);
        discordClient.on("error", () => {
            // TODO: Handle reconnection and bot status update
        });

        // Handle disconnecting the bot gracefully
        process.stdin.resume();

        process.on("exit", exitHandler.bind(null, {
            cleanup: true
        }));
        process.on("SIGINT", exitHandler.bind(null, {
            exit: true
        }));
        process.on("SIGUSR1", exitHandler.bind(null, {
            exit: true
        }));
        process.on("SIGUSR2", exitHandler.bind(null, {
            exit: true
        }));
    }

    /**
     * Handle command-line arguments passed to the executable.
     * @param {object} args Parsed arguments as an object.
     */
    function handleArgs(args) {
        // Path where all configs are stored
        const cfgPath = args["config-path"] || args.c;
        if (cfgPath) {
            global.discotronConfigPath = cfgPath;
            if (cfgPath[cfgPath.length - 1] === "/") {
                global.discotronConfigPath = cfgPath.substr(0, cfgPath.length - 1);
            }
        }
    }

    /**
     * Attempts to load the config from disk, checks for missing files
     */
    function loadConfig() {
        try {
            appConfig = require(global.discotronConfigPath + "/bot.json");
            if (typeof appConfig.token === "undefined" || appConfig.token === "") {
                Logger.err("Missing **token** in **bot.json**.");
                process.exit();
            }
            if (typeof appConfig.applicationId === "undefined" || appConfig.applicationId === "") {
                Logger.err("Missing **applicationId** in **bot.json**.");
                process.exit();
            }
            if (typeof appConfig.oauth2Secret === "undefined" || appConfig.oauth2Secret === "") {
                Logger.err("Missing **oauth2Secret** in **bot.json**.");
                process.exit();
            }
            if (typeof appConfig.redirectURI === "undefined" || appConfig.redirectURI === "") {
                Logger.err("Missing **redirectURI** in **bot.json**.");
                process.exit();
            }
        } catch (err) {
            Logger.err("Please run **npm install** and set up the application config.");
            process.exit();
        }

    }


    // Source: https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
    /**
     * Called when the application is about to be closed
     * @param {object} options Set options.exit to true to leave
     */
    function exitHandler(options) {
        discordClient.destroy().then(() => {
            if (options.exit) {
                process.exit();
            }
        }).catch(Logger.err);
    }
}
init();

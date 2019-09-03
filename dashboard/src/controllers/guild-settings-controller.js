window.Discotron.GuildSettingsController = class extends window.Discotron.Controller {
    /**
     * Ctor
     * @param {object} args Args given by the user in the URL
     */
    constructor(args) {
        super("admin/guild-settings.html", () => {
            this._guildId = args.guild;

            if (this._guildId === undefined) {
                window.location.replace("/dashboard");
                return;
            }
            Discotron.Guild.getAll().then((guilds) => {
                this._guild = guilds[this._guildId];
                if (this._guild === undefined) {
                    window.location.replace("/dashboard");
                }

                this._displayHeader();
                this._displayPrefix();
            });
            this._addEvents();
        });
    }

    /**
     * Displays the image of the guild and its name
     */
    _displayHeader() {
        document.getElementById("header-icon").src = this._guild.iconURL;
        document.getElementById("guild-name").textContent = this._guild.name;
        document.getElementById("manage-plugin-link").href += this._guild.discordId;
    }

    /**
     * Displays the form entry concerning the plugin prefix
     */
    _displayPrefix() {
        document.getElementById("prefix").value = this._guild.prefix;
    }

    /**
     * Display channel selector widget
     */
    _onAllowedChannelsClick() {
        //new Widgetmachin(channels, currentlyselectedChan, (lel) => {currentlyselectedChan = lel;} 
    }

    /**
     * Display userRole widget 
     */
    _onAdminsClick() {

    }

    /**
     * Callback to give to the channel selector widget
     */
    _onAllowedChannelsWidgetSave() {

    }

    /**
     * Callback to give to the user / role selector widget
     */
    _onAdminsWidgetSave() {

    }

    _addEvents() {
        document.getElementById("prefix").onkeydown = (e) => {
            document.getElementById("save").disabled = false;
            if (e.keyCode === 13) {
                document.getElementById("save").click();
            }
        };

        document.getElementById("save").onclick = () => {
            document.getElementById("save").disabled = true;
            this._guild.prefix = document.getElementById("prefix").value;
        };

        document.getElementById("channel-locking").onclick = () => {
            this._guild.getChannels().then((channels) => {
                let channelsId = [];
                for (const id in channels) {
                    if (channels[id].type === "text") {
                        channelsId.push(channels[id]);
                    }
                }

                let channelListArray = Array.from(this._guild.allowedChannelIds);

                new Discotron.ChannelListWidgetController(channelsId, channelListArray, (selectedChannels) => {
                    if (selectedChannels.length === channelsId.length) {
                        selectedChannels = []; // Everything selected => nothing selected
                    }
                    this._guild.allowedChannelIds = selectedChannels;
                });
            });
        };
    }
};
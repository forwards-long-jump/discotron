/**
 * Controller for the guild settings page
 */
window.discotron.GuildSettingsController = class extends window.discotron.Controller {
    /**
     * @class
     * @param {object} args Args given by the user in the URL
     */
    constructor(args) {
        super("admin/guild-settings.html", () => {
            this._discordGuildId = args.guild;

            if (this._discordGuildId === undefined) {
                window.location.replace("/dashboard");
                return;
            }
            discotron.Guild.getAll().then((guilds) => {
                this._guild = guilds[this._discordGuildId];
                if (this._guild === undefined) {
                    window.location.replace("/dashboard");
                }

                this._displayHeader();
                this._displayPrefix();
            }).catch(console.error);
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
     * Add events to the widget
     */
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
                let channelListArray = Array.from(this._guild.allowedChannelIds);

                new discotron.ChannelListWidgetController(channels, channelListArray, (selectedChannels) => {
                    if (selectedChannels.length === Object.keys(channelListArray).length) {
                        // TODO: Add a checkbox for this in particular
                        selectedChannels = []; // Everything selected => nothing selected
                    }
                    this._guild.allowedChannelIds = selectedChannels;
                });
            }).catch(console.error);
        };
        document.getElementById("admins").onclick = () => {
            let admins = Array.from(this._guild.admins);
            new discotron.UserRoleWidgetController(this._guild, admins, (newAdmins) => {
                this._guild.admins = newAdmins;
            }, true, "Admins", true);
        };
    }
};
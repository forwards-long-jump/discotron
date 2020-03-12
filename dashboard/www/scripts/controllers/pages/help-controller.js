/**
 * Controller for the help page
 */
window.discotron.HelpController = class extends window.discotron.Controller {
    /**
     * @class
     */
    constructor() {
        super("home.html", () => {
            this._displayHelp();
        });
    }

    /**
     * Display command helps, invite link and more
     */
    _displayHelp() {
        document.getElementById("bot-invite-link").href = discotron.config.inviteLink;
        // Query cards
        discotron.Plugin.getAll().then((plugins) => {

            for (const pluginId in plugins) {
                const plugin = plugins[pluginId];

                const template = document.getElementById("template-plugin-help");
                const pluginCard = document.importNode(template.content, true);

                pluginCard.querySelector(".plugin-help-header").textContent = plugin.name;
                pluginCard.querySelector(".plugin-description").textContent = plugin.description;

                for (let i = 0; i < plugin.commands.length; i++) {
                    const command = plugin.commands[i];

                    const commandTemplate = document.getElementById("template-command");
                    const commandContainer = document.importNode(commandTemplate.content, true);

                    let displayedCommand = "";

                    switch (command.triggerType) {
                        case "command":
                            displayedCommand = "!" + command.trigger;
                            break;
                        case "words":
                            displayedCommand = "Words: " + command.trigger.join(", ");
                            break;
                        case "all":
                            displayedCommand = "(all)";
                            break;
                    }

                    commandContainer.querySelector(".command").textContent = displayedCommand;

                    for (let j = 0; j < command.args.length; j++) {
                        const arg = command.args[j];
                        if (arg.defaultValue !== undefined) {
                            commandContainer.querySelector(".command-args").textContent += "[" + arg.name + "]";
                        } else {
                            commandContainer.querySelector(".command-args").textContent += "<" + arg.name + ">";
                        }
                    }

                    if (command.args.length === 0) {
                        commandContainer.querySelector(".command-args").textContent = "(no args)";
                    }

                    commandContainer.querySelector(".command-description").textContent = command.help;

                    pluginCard.querySelector(".plugin-commands").appendChild(commandContainer);
                }


                document.getElementById("plugin-list-container").appendChild(pluginCard);
            }
        }).catch(console.error);
    }
};
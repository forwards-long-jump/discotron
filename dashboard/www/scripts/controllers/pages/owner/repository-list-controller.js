/**
 * Controller for the list of repository page
 */
window.discotron.RepositoryListController = class extends window.discotron.Controller {
    /**
     * @class 
     */
    constructor() {
        super("owner/repository-list.html", () => {
            this._addEventListeners();
            this._displayRepositories();
        });
    }

    /**
     * Handle adding repository
     */
    _addEventListeners() {
        document.getElementById("add-repository").onclick = () => {
            this._onAddRepository();
        };

        document.getElementById("repository-url").onkeyup = (e) => {
            if (e.keyCode === 13) {
                document.getElementById("add-repository").onclick();
            }
        };
    }

    /**
     * Display the list of repositories and their plugins 
     */
    _displayRepositories() {
        discotron.Repository.getAll().then((repositories) => {
            if (repositories.length > 0) {
                document.getElementById("repositories-container").innerHTML = "";
            } else {
                document.getElementById("repositories-container").innerHTML = "<p class=\"description\">No repositories found. Try adding a public repository using the bar above.</p>";
            }

            for (let i = 0; i < repositories.length; i++) {
                const repo = repositories[i];
                const template = document.getElementById("template-repository-container");
                const container = document.importNode(template.content, true);

                container.querySelector(".plugin-bar").value = repo.url;
                const cardListContainer = container.querySelector(".repository-card-container");

                // Query cards
                discotron.Plugin.getAll().then((plugins) => {
                    let pluginFound = false;
                    for (const pluginId in plugins) {
                        const plugin = plugins[pluginId];
                        if (repo.pluginIds.includes(pluginId)) {
                            pluginFound = true;

                            const cardTemplate = document.getElementById("template-card");
                            const cardContainer = document.importNode(cardTemplate.content, true);
                            cardContainer.querySelector(".repository-card-title").textContent = (plugin.enabled ? "" : "[Disabled] ") + plugin.name;
                            cardContainer.querySelector(".repository-card-description").textContent = plugin.description;

                            const cardTitle = cardContainer.querySelector(".repository-card-title");

                            cardContainer.querySelector(".repository-card").onclick = () => {
                                new discotron.PluginSettingsWidgetController({
                                    plugin: plugin,
                                    onPluginSettingsSave: (settings) => {
                                        // Query API
                                        plugin.enabled = settings.enabled;
                                        plugin.prefix = settings.globalPrefix;

                                        // Update card
                                        cardTitle.textContent = (plugin.enabled ? "" : "[Disabled] ") + plugin.name;
                                    }
                                });
                            };

                            cardListContainer.appendChild(cardContainer);
                        }
                    }

                    for (let i = 0; i < repo.pages.length; i++) {
                        const page = repo.pages[i];
                        pluginFound = true;

                        const cardTemplate = document.getElementById("template-card");
                        const cardContainer = document.importNode(cardTemplate.content, true);
                        cardContainer.querySelector(".repository-card-title").textContent = "Page: /" + page;
                        cardContainer.querySelector(".repository-card-description").innerHTML = "Web page accessible <a href=\"/" + page + "\">here</a>";

                        cardListContainer.appendChild(cardContainer);

                    }


                    if (!pluginFound) {
                        cardListContainer.innerHTML = "<p class=\"description\">No plugin / pages found in this repository.</p>";
                    }
                }).catch(console.error);

                // Update
                container.querySelector(".pull-repository").onclick = async (event) => {
                    event.target.disabled = true;
                    event.target.value = "Updating...";

                    try {
                        await discotron.WebApi.put("repository", { url: repo.url });
                        event.target.value = "Update successful";
                    } catch (err) {
                        event.target.value = "Could not update: " + err;
                    }

                    discotron.Repository.clearCache();
                    discotron.Plugin.clearCache();
                    discotron.Guild.clearCache();
                    this._displayRepositories();
                };

                // Delete
                container.querySelector(".delete-repository").onclick = (event) => {
                    if (confirm("Deleting a repository will erase all related settings, continue?")) {
                        discotron.WebApi.delete("repository", { url: repo.url }).then(() => {
                            discotron.Repository.clearCache();
                            discotron.Plugin.clearCache();
                            discotron.Guild.clearCache();
                            this._displayRepositories();
                        }).catch(console.error);
                    }
                };

                document.getElementById("repositories-container").appendChild(container);
            }
        }).catch(console.error);
    }

    /**
     * Called when add repository button is pressed
     */
    async _onAddRepository() {
        const repoUrl = document.getElementById("repository-url").value;
        if (repoUrl !== "") {
            document.getElementById("add-repository").disabled = true;
            
            try {
                await discotron.WebApi.post("repository", { url: repoUrl });

                document.getElementById("repository-url").value = "";
                document.getElementById("repository-url").focus();

                discotron.Repository.clearCache();
                discotron.Plugin.clearCache();
                discotron.Guild.clearCache();
                this._displayRepositories();
            } catch (err) {
                document.getElementById("repository-error").textContent = "Could not load repository: " + err;
                document.getElementById("repository-url").focus();
                document.getElementById("repository-url").select();
            } finally {
                document.getElementById("add-repository").disabled = false;
            }
        }
    }
};

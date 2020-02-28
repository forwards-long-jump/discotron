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
                    for (let pluginId in plugins) {
                        const plugin = plugins[pluginId];
                        if (repo.pluginIds.includes(pluginId)) {
                            pluginFound = true;

                            const cardTemplate = document.getElementById("template-card");
                            const cardContainer = document.importNode(cardTemplate.content, true);
                            cardContainer.querySelector(".repository-card-title").textContent = (plugin.enabled ? "" : "[Disabled] ") + plugin.name;
                            cardContainer.querySelector(".repository-card-description").textContent = plugin.description;

                            const cardTitle = cardContainer.querySelector(".repository-card-title");

                            cardContainer.querySelector(".repository-card").onclick = () => {
                                new discotron.PluginSettingsWidgetController(plugin, (settings) => {
                                    // Query API
                                    plugin.enabled = settings.enabled;
                                    plugin.prefix = settings.globalPrefix;

                                    // Update card
                                    cardTitle.textContent = (plugin.enabled ? "" : "[Disabled] ") + plugin.name;
                                });
                            };

                            cardListContainer.appendChild(cardContainer);
                        }
                    }

                    for (let i = 0; i < repo.pages.length; i++) {
                        const page = repo.pages[i];
                        pluginFound = true;

                        let cardTemplate = document.getElementById("template-card");
                        let cardContainer = document.importNode(cardTemplate.content, true);
                        cardContainer.querySelector(".repository-card-title").textContent = "Page: /" + page;
                        cardContainer.querySelector(".repository-card-description").innerHTML = "Web page accessible <a href=\"/" + page + "\">here</a>";

                        cardListContainer.appendChild(cardContainer);

                    }


                    if (!pluginFound) {
                        cardListContainer.innerHTML = "<p class=\"description\">No plugin / pages found in this repository.</p>";
                    }
                }).catch(console.error);

                // Update
                container.querySelector(".pull-repository").onclick = (event) => {
                    event.target.disabled = true;
                    event.target.value = "Updating...";

                    discotron.WebAPI.queryBot("discotron-dashboard", "update-repository", {
                        url: repo.url
                    }).then((data) => {
                        if (data) {
                            event.target.value = "Update successful";
                        } else {
                            event.target.value = "Could not update";
                        }

                        discotron.Repository.clearCache();
                        discotron.Plugin.clearCache();
                        discotron.Guild.clearCache();
                        this._displayRepositories();
                    }).catch(console.error);
                };

                // Delete
                container.querySelector(".delete-repository").onclick = (event) => {
                    if (confirm("Deleting a repository will erase all related settings, continue?")) {
                        discotron.WebAPI.queryBot("discotron-dashboard", "remove-repository", {
                            url: repo.url
                        }).then((data) => {
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
    _onAddRepository() {
        let repoUrl = document.getElementById("repository-url").value;
        if (repoUrl !== "") {
            document.getElementById("add-repository").disabled = true;
            discotron.WebAPI.queryBot("discotron-dashboard", "add-repository", {
                url: repoUrl
            }).then((err) => {
                document.getElementById("add-repository").disabled = false;
                if (err) {
                    document.getElementById("repository-error").textContent = "Could not load repository: " + err;
                    document.getElementById("repository-url").focus();
                    document.getElementById("repository-url").select();
                } else {
                    document.getElementById("repository-url").value = "";
                    document.getElementById("repository-url").focus();

                    discotron.Repository.clearCache();
                    discotron.Plugin.clearCache();
                    discotron.Guild.clearCache();
                    this._displayRepositories();
                }
            }).catch(console.error);
        }
    }
};
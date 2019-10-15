/**
 * Controller for the list of repository page
 */
window.Discotron.RepositoryListController = class extends window.Discotron.Controller {
	/**
	 * @constructor 
	 */
	constructor() {
		super("owner/repository-list.html", () => {
			this._addEventListeners();
			this._displayRepos();
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
	_displayRepos() {
		Discotron.Repository.getAll().then((repositories) => {
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
				Discotron.Plugin.getAll().then((plugins) => {
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
								new Discotron.PluginSettingsWidgetController(plugin, (settings) => {
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
				});

				// Update
				container.querySelector(".pull-repository").onclick = (event) => {
					event.target.disabled = true;
					event.target.value = "Updating...";

					Discotron.WebAPI.queryBot("discotron-dashboard", "update-repository", {
						url: repo.url
					}).then((data) => {
						if (data) {
							event.target.value = "Update succesful";
						} else {
							event.target.value = "Could not update";
						}

						Discotron.Repository.clearCache();
						Discotron.Plugin.clearCache();
						Discotron.Guild.clearCache();
						this._displayRepos();
					});
				};

				// Delete
				container.querySelector(".delete-repository").onclick = (event) => {
					if (confirm("Deleting a repository will erase all related settings, continue?")) {
						Discotron.WebAPI.queryBot("discotron-dashboard", "remove-repository", {
							url: repo.url
						}).then((data) => {
							Discotron.Repository.clearCache();
							Discotron.Plugin.clearCache();
							Discotron.Guild.clearCache();
							this._displayRepos();
						});
					}
				};

				document.getElementById("repositories-container").appendChild(container);
			}
		});
	}

	/**
	 * Called when add repository button is presse
	 */
	_onAddRepository() {
		let repoUrl = document.getElementById("repository-url").value;
		if (repoUrl !== "") {
			document.getElementById("add-repository").disabled = true;
			Discotron.WebAPI.queryBot("discotron-dashboard", "add-repository", {
				url: repoUrl
			}).then((data) => {
				document.getElementById("add-repository").disabled = false;
				if (!data) {
					document.getElementById("repository-error").textContent = "Could not load repository";
					document.getElementById("repository-url").focus();
					document.getElementById("repository-url").select();
				} else {
					document.getElementById("repository-url").value = "";
					document.getElementById("repository-url").focus();

					Discotron.Repository.clearCache();
					Discotron.Plugin.clearCache();
					Discotron.Guild.clearCache();
					this._displayRepos();
				}
			});
		}
	}
};
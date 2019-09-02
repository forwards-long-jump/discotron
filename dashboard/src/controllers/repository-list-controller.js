window.Discotron.RepositoryListController = class extends window.Discotron.Controller {
	/**
	 * Ctor 
	 */
	constructor() {
		super("owner/repository-list.html", () => {
			this._addEventListeners();
			this._displayRepos();
		});
	}

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
	 * Display the list of repositories and the plugins 
	 */
	_displayRepos() {
		console.log("DIPALYING REPOS");

		Discotron.Repository.getAll().then((repositories) => {
			if (repositories.length > 0) {
				document.getElementById("repositories-container").innerHTML = "";
			} else {
				document.getElementById("repositories-container").innerHTML = "<p class=\"description\">No repositories found. Try adding a public repository using the bar above.</p>";
			}

			for (let i = 0; i < repositories.length; i++) {
				const repo = repositories[i];
				let template = document.getElementById("template-repository-container");
				let container = document.importNode(template.content, true);

				container.querySelector(".plugin-bar").value = repo.url;

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
						this._displayRepos();

						setTimeout(() => {
							event.target.disabled = false;
							event.target.value = "Pull from Master";
						}, 5000);
					});
				};

				// Delete
				container.querySelector(".delete-repository").onclick = (event) => {
					console.log(this);

					if (confirm("Deleting a repository will erase all related settings, continue?")) {
						Discotron.WebAPI.queryBot("discotron-dashboard", "remove-repository", {
							url: repo.url
						}).then((data) => {
							console.log("Done deleting", data);

							console.log("Clear cache");

							Discotron.Repository.clearCache();
							console.log(this, "Display repos");

							this._displayRepos();
						});
					}
				};

				document.getElementById("repositories-container").appendChild(container);
			}
		});
	}

	/**
	 * Add a plugin card
	 * @param {Plugin} plugin Plugin
	 */
	_displayPluginCard(plugin) {

	}

	/**
	 * Show the plugin settings widget for the selected plugin
	 */
	_onPluginClick() {

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
					this._displayRepos();
				}
			});
		}
	}

	/**
	 * Called when a repository is deleted
	 */
	_onRemoveRepository(arg) {

	}

	/**
	 * Called when the update button is pressed
	 */
	_onUpdateRepository() {

	}

	/**
	 * Called when repo refresh button is pressed
	 */
	_onRepositoryStatusRefresh() {

	}
};
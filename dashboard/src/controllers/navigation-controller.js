/**
 * Controller for the navigation bar, does not extends default controller
 */
window.discotron.NavigationController = class {
    /**
     * Load bot status and display it on top
     * @static
     */
    static displayBot() {
        discotron.WebAPI.queryBot("discotron-dashboard", "get-bot-info").then((data) => {
            document.querySelector("#bot-info img").src = data.avatar;
            document.querySelector("#bot-info span").textContent = data.tag;
        }).catch(console.error);
    }

    /**
     * Display links in the "owner" section
     * @static
     */
    static displayOwnerSettings() {
        discotron.WebAPI.queryBot("discotron-dashboard", "is-owner").then((data) => {
            if (data) {
                document.querySelectorAll(".bot-admin-link").forEach((element) => {
                    element.style.display = "list-item";
                });
            }
        }).catch(console.error);
    }

    /**
     * Display links in the "admin" section
     * @static
     */
    static displayServers() {
        discotron.Guild.getAll().then((guilds) => {
            if (Object.keys(guilds).length > 0) {
                document.querySelector(".description").style.display = "none";

                let serverLinksContainer = document.querySelector("#nav-links ul");
                let template = document.getElementById("template-server-link");

                for (let i in guilds) {
                    const guild = guilds[i];

                    let serverLink = document.importNode(template.content, true);

                    serverLink.querySelector(".server-link").href += guild.discordId;
                    serverLink.querySelector(".server-icon").src = guild.iconURL;
                    serverLink.querySelector(".server-name").textContent = guild.name;
                    serverLinksContainer.appendChild(serverLink);
                }
            }
        }).catch(console.error);
    }

    /**
     * Load user status and display it on top
     * @static
     */
    static displayUser() {
        document.querySelector("#user-info img").src = `https://cdn.discordapp.com/avatars/${localStorage.getItem("discordUserId")}/${localStorage.getItem("avatar")}.png`;
        document.querySelector("#user-info span").textContent = `${localStorage.getItem("username")}#${localStorage.getItem("discriminator")}`;
    }
};
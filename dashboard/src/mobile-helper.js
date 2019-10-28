window.discotron.mobileHelper = {
    /**
     * Hide or display the navigation bar
     */
    toggleNavBarDisplay: () => {
        const elementsToChange = ["nav", "#bot-info", "#nav-links", "#user-info"];
        const className = "menu-displayed";
        const shouldHide = document.querySelector("nav").classList.contains(className);

        document.querySelectorAll(elementsToChange.join(", ")).forEach((node) => {
            if (shouldHide) {
                node.classList.remove(className);
            } else {
                node.classList.add(className);
            }
        });
    },
    /**
     * Hide nav bar if displayed
     */
    hideNavBar: () => {
        const className = "menu-displayed";
        const shouldHide = document.querySelector("nav").classList.contains(className);

        if (shouldHide) {
            window.discotron.mobileHelper.toggleNavBarDisplay();
        }
    }
};
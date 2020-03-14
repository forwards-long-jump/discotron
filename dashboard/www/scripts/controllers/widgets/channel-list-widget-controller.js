/**
 * Widget to select channels
 */
window.discotron.ChannelListWidgetController = class extends window.discotron.WidgetController {
    /**
     * @class
     * @param {object} options Args
     * @param {Array} options.channels An array of Channel
     * @param {Array} options.selectedChannels Default selected channel discord ids
     * @param {Function} options.onChannelSelectorSave Callback called when the user is done selecting channel
     * @param {Function} options.onClose Callback called when the widget is closed
     */
    constructor({channels, selectedChannels, onChannelSelectorSave, onClose = () => {}}) {
        super({
            widgetPageName:  "channels-selector.html",
            onSave: () => {
                onChannelSelectorSave(this._getSelectedChannels());
            },
            onLoad: () => {
                this._channels = channels;
                this._selectedChannels = selectedChannels;

                this._displayChannels();
            },
            onClose: onClose
        });


    }

    /**
     * @returns {Array} An array of all channel ids that are currently selected
     */
    _getSelectedChannels() {
        const allContainers = this._widgetContainer.querySelectorAll(".channel-state");
        const results = [];
        for (let i = 0; i < allContainers.length; i++) {
            const element = allContainers[i];
            if (element.querySelector(".channel-selector-checkbox").checked) {
                results.push(element.dataset.discordId);
            }
        }
        return results;
    }

    /**
     * Add events to the checkboxes if needed to track selected channel state
     */
    _addEvents() {
        super._addEvents();
    }

    /**
     * Add a list of channel that can be selected to the modal
     */
    _displayChannels() {
        for (const discordId in this._channels) {
            const channel = this._channels[discordId];
            if (channel.type !== "text") {
                continue;
            }

            const template = document.getElementById("template-channel-state");
            const channelContainer = document.importNode(template.content, true);

            channelContainer.querySelector(".channel-state").dataset.discordId = channel.discordId;
            channelContainer.querySelector(".channel-selector-channel").textContent = "#" + channel.name;
            // No channel selected => "everything" is enabled      
            channelContainer.querySelector(".channel-selector-checkbox").checked = this._selectedChannels.includes(channel.discordId) || this._selectedChannels.length === 0;

            this._widgetContainer.querySelector(".channel-selector").appendChild(channelContainer);
        }
    }
};
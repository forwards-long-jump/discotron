/**
 * Widget to select channels
 */
window.Discotron.ChannelListWidgetController = class extends window.Discotron.WidgetController {
    /**
     * @constructor
     * @param {array} channels An array of Channel
     * @param {array} selectedChannels Default selected channel discord ids
     * @param {function} onChannelSelectorSave Callback called when the user is done selecting channel
     * @param {function} onClose Callback called when the widget is closed
     */
    constructor(channels, selectedChannels, onChannelSelectorSave, onClose = () => {}) {
        super("channels-selector.html", () => {
            // On save
            onChannelSelectorSave(this._getSelectedChannels());
        }, () => {
            // Widget loaded
            this._channels = channels;
            this._selectedChannels = selectedChannels;

            this._displayChannels();
        }, onClose);


    }

    /**
     * @returns An array of all channel ids that are currently selected
     */
    _getSelectedChannels() {
        let allContainers = this._widgetContainer.querySelectorAll(".channel-state");
        let results = [];
        for (let i = 0; i < allContainers.length; i++) {
            const element = allContainers[i];
            if (element.querySelector(".channel-selector-checkbox").checked) {
                results.push(element.dataset.channelId);
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
        for (let i = 0; i < this._channels.length; i++) {
            const channel = this._channels[i];
            let template = document.getElementById("template-channel-state");
            let channelContainer = document.importNode(template.content, true);

            channelContainer.querySelector(".channel-state").dataset.channelId = channel.id;
            channelContainer.querySelector(".channel-selector-channel").textContent = "#" + channel.name;
            // No channel selected => "everything" is enabled
            channelContainer.querySelector(".channel-selector-checkbox").checked = this._selectedChannels.includes(channel.id) || this._selectedChannels.length === 0;

            this._widgetContainer.querySelector(".channel-selector").appendChild(channelContainer);
        }
    }
};
window.Discotron.ChannelListWidgetController = class extends window.Discotron.WidgetController {
    /**
     * Ctor
     * @param {array} channels An array of Channel
     * @param {array} selectedChannels Default selected channel discord ids
     * @param {function} onChannelSelectorSave Callback called when the user is done selecting channel
     * @param {function} onClose Callback called when the widget is closed
     */
    constructor(channels, selectedChannels, onChannelSelectorSave, onClose = () => {}) {
        super("channels-selector.html", () => {
            onChannelSelectorSave(this._getSelectedChannels());
        }, onClose);

        this._channels = channels;
        this._selectedChannels = selectedChannels;

        this._addEvents();
        this._displayChannels();
    }

    /**
     * Returns an array of all channel ids that are currently selected
     */
    _getSelectedChannels() {
        // for each html elements
        //  check is checked, and data-channel-id
        // return selectedChannels;
    }

    /**
     * Add events to the checkboxes if needed to track selected channel state
     */
    _addEvents() {

    }

    /**
     * Add a list of channel that can be selected to the modal
     */
    _displayChannels() {

    }
};
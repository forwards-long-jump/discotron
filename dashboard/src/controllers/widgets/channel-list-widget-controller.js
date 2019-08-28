window.Discotron.ChannelListWidgetController = class extends window.Discotron.WidgetController {

    constructor(channels, selectedChannels, onChannelSelectorSave, onClose = () => {}) {
        super("channels-selector.html", () => {
            onChannelSelectorSave(this._getSelectedChannels());
        }, onClose);

        this._channels = channels;
        this._selectedChannels = selectedChannels;

        this._addEvents();
        this._displayChannels();
    }

    _getSelectedChannels() {
        // for each html elements
        //  check is checked, and data-channel-id
        // return selectedChannels;
    }

    _addEvents() {

    }

    _displayChannels() {

    }
};
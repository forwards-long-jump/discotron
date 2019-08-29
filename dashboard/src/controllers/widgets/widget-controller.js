window.Discotron.WidgetController = class {
	/**
	 * Ctor
	 * @param {string} widgetPageName Name of the html file of the widget 
	 * @param {function} onSave  Called when the user saves
	 * @param {function} onClose Called when widget is closed
	 */
	constructor(widgetPageName, onSave, onClose = () => {}) {
		this._onClose = onClose;
		this._onSave = onSave;
		this._widgetPageName = widgetPageName;
	}

	/**
	 * Display modal, OK and Cancel button, background
	 */
	_displayWidget() {

	}

	/**
	 * Add on close, on save, on background click, ...
	 */
	_addEvents() {

	}
};


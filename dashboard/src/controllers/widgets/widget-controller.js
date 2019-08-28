window.Discotron.WidgetController = class {
	constructor(widgetPageName, onSave, onClose = () => {}) {
		this._onClose = onClose;
		this._onSave = onSave;
		this._widgetPageName = widgetPageName;
	}

	_displayWidget() {
		// display modal, OK and Cancel button, background
	}

	_addEvents() {
		// add on close, on save, on background click, ...
	}
};


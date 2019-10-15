// Source: https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
const controlCodes = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m"
};

const colors = {
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    magenta: "\x1b[35m"
};

// Duplicates allows users to use different variants
const severityToLevel = {
    "debug": 1,
    "info": 2,
    "warning": 3,
    "warn": 3,
    "err": 4,
    "error": 4,
    "none": 5
};

// Convert a level to text that will be displayed in the console
const levelToText = {
    1: colors.magenta + "[DEBUG]",
    2: colors.green + "[INFO]",
    3: colors.yellow + "[WARN]",
    4: colors.red + "[ERR]"
};


/**
 * An utility class which is basically a fancy console.log
 */
class Logger {
    /**
     * Set the minimum severity required for a message to be displayed. Order is: debug < info < warning < error < none
     * @static
     * @param {string} severity New required severity for a message to be displayed (can be: err, info, warn, debug, none)
     */
    static setSeverity(severity) {
        Logger.level = severityToLevel[severity];
    }

    /**
     * Shortcut for Logger.log(value, "err");
     * @param {object} value to log, either string or object
     */
    static err(value) {
        Logger.log(value, "err");
    }

    /**
     * Log something to the console.
     * \**text** can be used for bold
     * \__text__ can be used for underline
     * @static
     * @param {string|object} value Message to display. If it is not a string, it will be displayed on another line.
     * @param {string} [severity="debug"] Severity of the message (can be: err, info, warn, debug)
     */
    static log(value, severity = "debug") {
        let level = severityToLevel[severity];

        if (Logger.level <= level) {

            if (typeof value === "string") {
                value = value.replace(/\*\*(.*?)\*\*/g, controlCodes.bright + "$1" + controlCodes.reset);
                value = value.replace(/__(.*?)__/g, controlCodes.underscore + "$1" + controlCodes.reset);
            }

            let date = new Date();
            let displayedDate = `[${date.toLocaleDateString()} ${date.toLocaleTimeString()}]`;

            console.log(
                `${controlCodes.dim}${displayedDate}${controlCodes.reset} ` +
                `${levelToText[level].padEnd(13)}${controlCodes.reset}: `,
                value,
                controlCodes.reset
            );
        }
    }
}

Logger.level = severityToLevel.info;

module.exports = Logger;
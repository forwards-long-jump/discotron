/**
 * Source: https://stackoverflow.com/questions/4482686/check-synchronously-if-file-directory-exists-in-node-js
 * @param {object} object object
 * @returns {boolean} True if the object is empty
 */
module.exports.isEmpty = (object) => {
    return Object.entries(object).length === 0 && object.constructor === Object;
};
const database = require(__dirname + "/../utils/database-helper.js").getDatabase();
const Logger = require(__dirname + "/../utils/logger.js");

/**
 * Returns whether the given associative array is empty
 * Source: https://stackoverflow.com/questions/4482686/check-synchronously-if-file-directory-exists-in-node-js
 * @param {object} associativeArray Associative array
 * @returns {boolean} True if the associative array is empty
 */
function isEmpty(associativeArray) {
    return Object.entries(associativeArray).length === 0 && associativeArray.constructor === Object;
}

/**
 * Returns a string in the format "KEY1 = $KEY1 separator KEY2 = $KEY2", as well as the given associative array with its keys prefixed by $
 * @param {object} where Associative array field => value
 * @param {string} separator Separator between entries
 * @returns {object} Associative array containing the string and the transformed associative array given in the parameters
 */
function generateParameters(where, separator = " AND ") {
    let params = "";
    let objParam = {};
    for (let key in where) {
        params += key + " = $" + key + separator;
        objParam["$" + key] = where[key];
    }
    return {
        text: params.substr(0, params.length - separator.length),
        objParam: objParam
    };
}

/**
 * Returns the string describing the columns, the string describing the values, and the given associative array with its keys prefixed by $
 * @param {object} values Associative array field => value
 * @returns {object} Associative array containing the columns text, the values text, and the transformed associative array given in the parameters
 */
function generateValuesForInsert(values) {
    let columns = "(";
    let params = "(";
    let data = {};
    for (let key in values) {
        columns += key + ",";
        params += "$" + key + ",";
        data["$" + key] = values[key];
    }
    return {
        columns: columns.substr(0, columns.length - 1) + ")",
        params: params.substr(0, params.length - 1) + ")",
        data: data
    };
}

module.exports.update = (table, values, where) => {
    let sql = "UPDATE " + table + " SET ";

    let valuesText = "";
    let params = [];
    for (let key in values) {
        valuesText += key + "=?,";
        params.push(values[key]);
    }
    valuesText = valuesText.substr(0, valuesText.length - 1);

    let whereText = "";
    for (let key in where) {
        whereText += key + "=? AND ";
        params.push(where[key]);
    }
    whereText = whereText.substr(0, whereText.length - 5);

    sql += valuesText + " WHERE " + whereText;
    database.run(sql, params, (err) => {
        if (err) {
            Logger.log("Update in database failed : " + sql, "err");
        }
    });
};

module.exports.insert = (table, values) => {
    let sql = "INSERT INTO " + table;
    let parameters = generateValuesForInsert(values);
    sql += " " + parameters.columns + " VALUES " + parameters.params;

    database.run(sql, parameters.data, (err) => {
        if (err) {
            Logger.log("Insert in database failed : " + sql, "err");
        }
    });
};

module.exports.delete = (table, where) => {
    let sql = "DELETE FROM " + table;
    if (!isEmpty(where)) {
        let parameters = generateParameters(where);
        sql += " WHERE " + parameters.text;
        database.run(sql, parameters.objParam, (err) => {
                if (err) {
                    Logger.log("Delete in database failed : " + sql, "err");
                }
            });
    }
};

module.exports.select = (table, fields = [], where = {}) => {
    return new Promise((resolve, reject) => {
        let sql = "SELECT ";

        if (fields.length === 0) {
            sql += "*";
        } else {
            sql += fields.join(",");
        }

        sql += " FROM " + table + " ";

        if (!isEmpty(where)) {
            let parameters = generateParameters(where);
            sql += "WHERE " + parameters.text;

            database.all(sql, parameters.objParam, (err, rows) => {
                if (err) {
                    Logger.log("Select in database failed : " + sql, "err");
                    reject();
                }
                resolve(rows);
            });
        } else {
            database.all(sql, (err, rows) => {
                if (err) {
                    Logger.log("Select in database failed : " + sql, "err");
                    reject();
                }
                resolve(rows);
            });
        }
    });
};
/*
 *     Copyright (C) 2020   Floffah
 *
 *     @author Floffah & Mangium Contributors
 *     @link https://github.com/floffah/
 */

module.exports = {
    createTable() {
        return "CREATE TABLE 'settings' (\n" +
            "'name' varchar(255),\n" +
            "'data' json" +
            ")"
    },
    setupAdmin() {
        return "insert or replace into settings (name, data) values (?, ?);"
    }
}
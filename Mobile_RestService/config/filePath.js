//Installed a NPM package to get the application path (npm install -s app-root-path)
const appRoot = require("app-root-path");

module.exports = {
    contracts: appRoot + "/Contracts", 
    nedb: appRoot + "/Messaging_Server/db_notification.db" 
}
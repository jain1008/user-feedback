var mysql = require('mysql');
var connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'fa@123',
    database: 'oprflowe_operation'
});
module.exports = connection;
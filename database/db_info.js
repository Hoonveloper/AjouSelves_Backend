const mysql = require("mysql2");

const DBconnection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	pprt : '3306',
	password : 'wkddmsgkr156-',
	database : 'firsttest'
});

module.exports = DBconnection;
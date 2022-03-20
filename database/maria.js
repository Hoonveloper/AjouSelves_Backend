const maria = require('mysql');

const connectDB= maria.createConnection({
    host:'localhost',
    port:3306,
    user:'user',
    password:'1234',
    database:'prac'

});
module.exports= connectDB;
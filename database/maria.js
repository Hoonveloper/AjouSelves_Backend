const maria = require('mariadb');



const pool=maria.createPool({
    host:'localhost',
    port:3306,
    user:'user',
    password:'1234',
    database:'prac'

})
module.exports= maria;
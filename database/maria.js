const maria = require('mysql');



var database={};

database.init= function(app,config){
console.log("init() 호출");
   connect(app,config);
}


function connect(app,config){
    console.log("connect() 호출");

    var db= maria.createConnection({
        host:config.db_host,
        port:config.db_port,
        user:config.db_user,
        password:config.db_pw,
        database:config.db_name

    })
    db.connect();
    database.db=db;

    app.set('database',database);
}

// const pool=maria.createPool({
//     host:'localhost',
//     port:3306,
//     user:'user',
//     password:'1234',
//     database:'prac'

// })
 module.exports= database;
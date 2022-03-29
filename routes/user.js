const express = require("express");
const router = express.Router();
const crypto = require('crypto');
const DB = require('../database/maria'); // DB 정보 가져오기
DB.connect();
const usertag = 'INSERT INTO USERS (userid, email, password, salt, nickname, status, socialtype, sex, birth, address, account, create_at, profilelink) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)';

//body-parser
router.use(express.urlencoded({extended:true}));
router.use(express.json());

function createHashedPassword(plainPassword) {
        const salt = crypto.randomBytes(64).toString('base64')
        return [crypto.pbkdf2Sync(plainPassword, salt, 9999, 64, 'sha512').toString('base64'), salt];
}

// 형식에 맞게 json 파일로 넘겨주면 이를 user db에 넣어준다.
router.post('/add', (req,res) => {
    const rebo = req.body;
    const hasfun = createHashedPassword(rebo.password);
    const salt = hasfun[1];
    const password = hasfun[0];
    const reqvalue = [rebo.userid, rebo.email, password, salt, rebo.nickname, rebo.status, rebo.socialtype, rebo.sex, rebo.birth, rebo.address, rebo.account, rebo.create_at, rebo.profileLink];
    DB.query(usertag,reqvalue, (err,result,fileds) => {
        if(err) console.log(err);
        console.log(req.body);
        res.json({status:"success"});
    })
   //console.log("User add");
})

// id 정보를 통해 db에서 정보 가져오기
router.get('/get/:id', (req,res) => {
    const number = req.params.id;
    DB.query(`select *from users where email=?`,number,(err,result,fileds)=>{
        if(err) console.log("DB Get Error");
        res.send(result);    
    })
})

router.get('/get', (req,res) => {
    DB.query('SELECT *FROM USERS', (err,result,fileds)=>{
        if(err) alert("DB Get Error");
        res.send(result);
        // 정렬해서 넘겨줄 필요가 있다.    
    })
})

router.delete('/delete/:id', (req,res) => {
    const number = req.params.id;
    DB.query(`delete from users where userid =?`, number, (err,result,fileds) => {
        if(err) console.log("DB Delete Error");
        res.json({status:"success"});
    })
})

router.put('/edit/', (req,res) => {
    res.json({status:"success"});
})


module.exports = router;

/*


var adduser = function (req,res) {
    
    //회원가입 했을때 받은 정보를 db에 저장.
    INSERT into [test](값들)
        value(받은 값 넣기)
    

}

var getuser = function (req,res){

    //mypage 들어갔을떄 정보 가져오는 코드
    //mypage에 들어갔을때 DB에서 정보를 가져와서 프론트로 보내주는것

}

var deluser = function (req,res){

    //회원 탈퇴시 db에서 유저 삭제하는 코드
    //on delete cascade 사용해서 회원 탈퇴시 데베에서 연결된 모든것 삭제

}

var edituser = function(req,res) {
    
    // mypage 에서 회원정보 수정했을때 db에 저장하는 코드
    // Mypage에서 회원정보를 수정했을때 DB도 동시에 수정이 되어야한다.
    
}

*/
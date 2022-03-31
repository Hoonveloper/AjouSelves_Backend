const express = require("express");
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const DB = require('../database/maria'); // DB 정보 가져오기
DB.connect();

//body-parser
router.use(express.urlencoded({extended:true}));
router.use(express.json());

// 비밀번호 암호화(crypto, salt 사용)
function createHashedPassword(plainPassword) {
        const salt = crypto.randomBytes(64).toString('base64')
        return [crypto.pbkdf2Sync(plainPassword, salt, 9999, 64, 'sha512').toString('base64'), salt];
}

// 회원가입 형식에 맞는 json 파일을 받아 이를 user db에 넣어준다.
router.post('/register', (req,res) => {
    const body = req.body;
    // 이메일 중복 여부를 체크해준다.
    DB.query(`select email from users where email = ?`,body.email, (err,result,fields) => {
        if(Object.keys(result).length === 0){ //result 객체가 값이 없으면 중복되지 않는다.
            const encryption = createHashedPassword(body.password);
            const userquery = 'INSERT INTO USERS (email, password, salt, nickname, status, socialtype, sex, birth, address, account, profilelink) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
            const salt = encryption[1];
            const password = encryption[0];
            const uservalue = [body.email, password, salt, body.nickname, body.status, body.socialtype, body.sex, body.birth, body.address, body.account, body.profilelink];
            DB.query(userquery,uservalue, (err,result,fileds) => {
                if(err) console.log(err);
                console.log(req.body);
                res.json({status:"success"});
            })
        }
        else{ // result 객체에 중복되는 email이 존재한다.
            res.json({status : "email duplicate"});
        }
    })
})

//비밀번호 확인 라우터
router.get('/verify', (req,res) => {
    const email = req.body.email;
    const pw = req.body.password;
    DB.query(`select salt, password from users where email = ?`, email, (err,result,fields) => {
        const dbsalt = result[0].salt;
        const dbpw = result[0].password;
        const reqpw = [crypto.pbkdf2Sync(pw, dbsalt, 9999, 64, 'sha512').toString('base64')];
        if(reqpw == dbpw){
            res.json({status:"success"});
        }
        else{
            console.log('비밀번호가 일치하지 않습니다.');
            res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
        }
    })
    
})

module.exports = router;


// router.get('/login', (req,res) => {
//     jwt.sign
// })

// user login 처리
// router.post('/login', (req,res) => {
//
//})


// var kakao = function(req,res){


//     //카카오 로그인 코드
//     // access 토큰 발급받아서 카카오한테 정보 얻고 jwt토큰 res에 담아서 넘겨주기.
// }
// var local = function (req,res){
//     //로컬 로그인 코드
//     // 비밀번호 암호화 후 db에 있는 암호랑 비교 후 맞다면 jwt토큰 발급
//     // 비교 후 틀리다면 로그인 실패



// }


// module.exports.kakao=kakao;
// module.exports.local=local;
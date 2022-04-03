const express = require("express");
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const DB = require('../database/maria'); // DB 정보 가져오기
const { smtpTransport } = require('../config/email');

DB.connect();

//body-parser
router.use(express.urlencoded({extended:true}));
router.use(express.json());

//인증번호 생성함수.
const generateRandom = function (min, max) {
    var ranNum = Math.floor(Math.random()*(max-min+1)) + min;
    return ranNum;
}
// 비밀번호 암호화(crypto, salt 사용)
function createHashedPassword(plainPassword) {
        const salt = crypto.randomBytes(64).toString('base64')
        return [crypto.pbkdf2Sync(plainPassword, salt, 9999, 64, 'sha512').toString('base64'), salt];
}

// 회원가입 형식에 맞는 json 파일을 받아 이를 user db에 넣어준다.
router.post('/register', async function(req,res) {
    const body = req.body;
    const encryption = createHashedPassword(body.password);
    const userquery = 'INSERT INTO USERS (email, password, salt, phonenumber, nickname, status, socialtype, sex, birth, address, account, profilelink) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';
    const salt = encryption[1];
    const password = encryption[0];
    const uservalue = [body.email, password, salt, body.phonenumber, body.nickname, body.status, body.socialtype, body.sex, body.birth, body.address, body.account, body.profilelink];
    DB.query(userquery,uservalue, (err,result,fileds) => {
        if(err) console.log(err);
        console.log(req.body);
        res.json({status:"success"});
    })
        
        
    
});

const emailVerification = async function(req,res){
    const email= req.body.email;
    const number = generateRandom(111111,999999);
    const mailoptions={
        from:"ajouselves@naver.com",
        to :email,
        subject:"[Goods By us] 인증 관련 메일입니다.",
        text: "오른쪽 숫자 6자리를 입력해주세요 : " + number
    }

    try{
        const [data]= await DB.promise().query(`select email from users where email = '${email}'`);
        console.log(data);
        if (Object.keys(data).length === 0) {

            //이메일 verification 코드
            const result = await smtpTransport.sendMail(mailoptions,(error,response) => {
                if(error){
                    console.log(error);
                    return res.status(400).send({status:"이메일 오류"});
    
                }else {
                    /* 클라이언트에게 인증 번호를 보내서 사용자가 맞게 입력하는지 확인! */
                        return res.status(200).send({
                            number: number
                        });
                    }
                smtpTransport.close();
            });

        }
        else {
            //이미 존재하는 유저. 
            res.json({status : "email duplicate"});
        }
        
    }catch(e){
        console.log(e);
        res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });

    }
}

//비밀번호 일치 확인 라우터
router.get('/verifypw', (req,res) => {
    const email = req.body.email;
    const pw = req.body.password;
    DB.query(`select salt, password from users where email = ?`, email, (err,result,fields) => {
        const dbsalt = result[0].salt;
        const dbpw = result[0].password;
        const reqpw = [crypto.pbkdf2Sync(pw, dbsalt, 9999, 64, 'sha512').toString('base64')];
        if(reqpw == dbpw){
            console.log("로그인 성공");
            res.json({status:"success"});
        }
        else{
            console.log('비밀번호가 일치하지 않습니다.');
            res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
        }
    })
    
})

// email 중복 여부 확인
router.get('/verifyid', (req,res) => {
    const reqemail = req.body.email;
    DB.query(`select email from users where email = ?`, reqemail, (err,result,fields) => {
        if(result[0] == undefined){
            console.log("이 이메일은 사용 가능합니다.");
            res.json({status:"success"});
        }
        else{
            const idverify = result[0].email;
            if(reqemail == idverify){
                console.log("이메일이 중복됩니다. 다른 이메일을 입력해주세요");
                res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
            }
            else{
                console.log("이 이메일은 사용 가능합니다.");
                res.json({status:"success"});
            }    
        }
    })
})

router.post('/email',emailVerification);
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
const express = require("express");
const router = express.Router();
const crypto = require('crypto');
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

// email을 중복체크 하기 위한 함수. 중복이 있으면 true 반환, 중복이 없으면 false 반환.
function isdup(temp){
    return duplicate = temp.some(function(x){
        return temp.indexOf(x) !== temp.lastIndexOf(x);
    })
}

// 회원가입 형식에 맞는 json 파일을 받아 이를 user db에 넣어준다.
router.post('/add', (req,res) => {
    const body = req.body;
    const encryption = createHashedPassword(body.password);
    const userquery = 'INSERT INTO USERS (email, password, salt, nickname, status, socialtype, sex, birth, address, account, profilelink) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
    const salt = encryption[1];
    const password = encryption[0];
    const uservalue = [body.email, password, salt, body.nickname, body.status, body.socialtype, body.sex, body.birth, body.address, body.account, body.profileLink];
    DB.query(`select email from users`,(err,result) => {
        const temp = result.map( v => v.email);
        temp.push(body.email);
        console.log(isdup(temp));

        if(isdup(temp) == true){ // 중복이 발생했다.
            temp.pop();
            res.json({status:"email duplicate"});
        }
        else{
            DB.query(userquery,uservalue, (err,result,fileds) => {
                if(err) console.log(err);
                console.log(req.body);
                res.json({status:"success"});
            })
        }
        
    })
    
})

// user의 고유 id를 받아 user의 정보 db에서 보내준다.
router.get('/get/:id', (req,res) => {
    const userid = req.params.id;
    DB.query(`select *from users where userid = ?`,userid,(err,result,fileds)=>{
        if(err) console.log("DB Get Error");
        res.json(result);    
    })
})

// 모든 user의  정보를 보내준다. 임시로 만들어봄
router.get('/get', (req,res) => {
    DB.query('SELECT *FROM USERS', (err,result,fileds)=>{
        if(err) alert("DB Get Error");
        res.json(result);
        // 정렬해서 넘겨줄 필요가 있다.    
    })
})

// user의 고유아이디를 받아 DB에서 관련된 모든 정보를 삭제한다.(회원탈퇴)
// url에 id를 받을지 아니면 값으로 요청받을지 고민이 필요해보인다.
router.delete('/delete/:id', (req,res) => {
    const userid = req.params.id;
    DB.query(`delete from users where userid =?`, userid, (err,result,fileds) => {
        if(err) console.log("DB Delete Error");
        res.json({status:"success"});
    })
})

// 수정할 값들과 고유아이디를 받아 값들을 수정해준다.
router.put('/edit', (req,res) => {
    const body = req.body;
    const userid = body.userid;
    const nickname = body.nickname;
    const birth = body.birth;
    const address = body.address;
    const account = body.account;

    console.log(body);

     DB.query(`update users set nickname = '${nickname}', birth = '${birth}', address = '${address}', account = '${account}' where userid = ?`,userid, (err,result,fileds) => {
          if(err) console.log(err);
          res.json({status:"success"});
      })
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
const express = require("express");
const router = express.Router();
const DB = require('../database/db_info'); // DB 정보 가져오기
DB.connect();
const usertag = 'INSERT INTO USER (userid, password, email, status, nickname, socialtype, sex, birth, address, account, create_at, profileLink) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';

//body-parser
router.use(express.urlencoded({extended:true}));
router.use(express.json());

// 형식에 맞게 json 파일로 넘겨주면 이를 user db에 넣어준다.
router.post('/add', (req,res) => {
    const rebo = req.body;
    const reqvalue = [rebo.userid, rebo.password, rebo.email, rebo.status, rebo.nickname, rebo.socialtype, rebo.sex, rebo.birth, rebo.address, rebo.account, rebo.create_at, rebo.profileLink];
    DB.query(usertag,reqvalue, (err,result,fileds) => {
        if(err) console.log(err);
        console.log("add success");
        res.send(req.body);
    })
   console.log("User add");
})

router.get('/get/:id', (req,res) => {
    const number = req.params.id;
    DB.query('SELECT *FROM USER', (err,result,fileds)=>{
        if(err) alert("DB Get Error");
        res.send(result[number]);    
    })
})

router.get('/get/', (req,res) => {
    const number = req.params.id;
    DB.query('SELECT *FROM USER', (err,result,fileds)=>{
        if(err) alert("DB Get Error");
        res.send(result);    
    })
})

router.delete('/delete/:id', (req,res) => {
    res.send("User delete");
})

router.put('/edit/', (req,res) => {
    res.send("User delete");
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

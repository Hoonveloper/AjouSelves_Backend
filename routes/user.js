const express = require("express");
const router = express.Router();
const DB = require('../database/db_info'); // DB 정보 가져오기
DB.connect();
const usertag = 'INSERT INTO USER (userid, password, email, status, nickname, socialtype, sex, birth, address, account, create_at, profileLink) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';
const temp = [3, 'abc', '1231231@asdf.com', '외부', 'john', '', 1, '1999-06-04', '청주', '3333', '2020-03-04', ''];


router.post('/add', (req,res) => {
    //const obj = JSON.parse(req.body);
    DB.query(usertag,temp, (err,result,fileds) => {
        if(err) console.log(err);
        res.send(result);
        console.log(result);
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

const express = require("express");
const router = express.Router();
const crypto = require('crypto');
const DB = require('../database/maria'); // DB 정보 가져오기
const { create } = require("domain");
DB.connect();

//body-parser
router.use(express.urlencoded({extended:true}));
router.use(express.json());

// user의 고유 id를 받아 user의 정보 db에서 보내준다.
router.get('/:id', (req,res) => {
    const userid = req.params.id;
    DB.query(`select *from users where userid = ?`,userid,(err,result,fileds)=>{
        if(err) console.log("DB Get Error");
        res.json(result);    
    })
})

// 모든 user의  정보를 보내준다. 임시로 만들어봄
router.get('/', (req,res) => {
    DB.query('SELECT *FROM USERS', (err,result,fileds)=>{
        if(err) alert("DB Get Error");
        res.json(result);
        // 정렬해서 넘겨줄 필요가 있다.    
    })
})

// user의 고유아이디를 받아 DB에서 관련된 모든 정보를 삭제한다.(회원탈퇴)
// url에 id를 받을지 아니면 값으로 요청받을지 고민이 필요해보인다.
router.delete('/:id', (req,res) => {
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

     DB.query(`update users set nickname = '${nickname}', birth = '${birth}', address = '${address}', account = '${account}' where userid = ?`,userid, (err,result,fileds) => {
          if(err) console.log(err);
          res.json({status:"success"});
      })
})

module.exports = router;

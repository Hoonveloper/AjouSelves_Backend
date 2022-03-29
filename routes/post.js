const express = require('express');
const router =express.Router();
const jwt = require('jsonwebtoken');
const db= require('../database/maria');
db.connect();


const jwtMiddleware=(req,res,next)=> {
    const token = req.header.token;
    try {
        const decode = jwt.verify(token,"SEC") // thopw
        if(decode) {
            req.user = decode;
            next();
        }
        else {
            res.json({
                status:"fail",
                msg:"유효하지 않은 토큰, 로그인 안했다"
            })
        }
    }
    catch(e) {
        res.json({
            status:"fail",
            msg:"유효기간 만료"
        })
    }
};

//router.use(jwtMiddleware);
var searchpostbytitle = async function(req,res){
    //검색을 통해 db에서 제목으로 검색
    //SELECT * FROM POSTS WHERE title = req.asdf 이런식으로 제목으로 검색
    const title =req.body.title;
    console.log(title);
 
    try{
        const [data] = await db.promise().query(`SELECT p.postID,p.title, p.explained, p.created_at, u.NICKNAME FROM posts AS p JOIN users as u ON p.userid=u.userid where title LIKE '%${title}%';`);
        console.log(data);
        res.json(data);
    }catch{
        console.log('searchbytitle error 발생!');
        res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
    }
}

var getpost= async function(req,res){
     /*
    디테일한 post 정보 가져오는 코드 (댓글 포함)

    */
    const id = req.params.id;
    try{
        const [post]= await db.promise().query(`SELECT p.postID, u.NICKNAME, p.title,p.explained, p.created_at FROM posts AS p JOIN users AS u ON p.userID=u.userid WHERE p.postid=${id};`);
        post.comments=new Array();
        const [comments]= await db.promise().query(`SELECT * FROM comments WHERE postid=${id}`);
        comments.map((e)=> {
            var temp= new Object();
            temp.postid=e.postid;
            temp.userid=e.userid;
            temp.created_at=e.created_at;
            temp.comments=e.comments;
            temp.nickname=e.nickname;
            temp = JSON.stringify(temp);
            post.push(JSON.parse(temp));
        })
        console.log(post);
        res.send(post);
    }catch{
        console.log('getcomments에서 error 발생!');
        res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
    }

}

   
var getALLpost= async function(req,res){
   /*모든 project 정보 가져오는 코드
    SELECT * FROM posts ORDER BY created_ at (desc) -> 최신순
    SELECT * FROM posts ORDER BY created_ at (desc) -> 오래된순
    */

    try{
        const [data] = await db.promise().query(`SELECT p.title, p.explained, p.created_at, u.userid, u.NICKNAME FROM posts as p join users as u ON p.userid=u.userid ORDER BY created_at DESC`);
        console.log(data);
        res.json(data);


    }catch{

        console.log('getALLpost에서 error 발생!');
        res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
    }
}

var addpost= async function(req,res){
 //INSERT INTO posts() VALUES()...
//project 정보 db에 저장하는코드

    const userid=req.body.userid;
    const title= req.body.title;
    const explained= req.body.explained;
    console.log(req.body);
    try{
        const data=await db.promise().query(`INSERT INTO posts(userid,title,explained) VALUES(${userid},'${title}','${explained}')`);
        res.json({status:"success"});

    }catch{
        console.log('addpost에서 error 발생!');
        res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });

    }

}


var editpost= async function(req,res){

    const postid = req.params.id;
    const title= req.body.title;
    const explained= req.body.explained;
    console.log(req.body);
    try{
        const data= await db.promise().query(`UPDATE posts SET title='${title}', explained='${explained}' WHERE postid=${postid};`);
        res.json({status:"success"});

    }catch{
        console.log('editpost에서 error 발생!');
        res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });

    }
    

}

var delpost = async function(req,res){
    const postid = req.params.id;
    try{
        const data =await db.promise().query(`DELETE FROM posts WHERE postid=${postid};`);
        console.log(data);
        res.json({status:"success"});
    }catch{
        console.log('editpost에서 error 발생!');
        res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
    }
}

router.post("/searchbytitle",searchpostbytitle);
router.get("/all",getALLpost);
router.get("/:id",getpost);
router.put("/edit/:id",editpost);
router.delete("/delete/:id",delpost);
router.post("/add",addpost);
module.exports = router;

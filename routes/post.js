const express = require('express');
const router =express.Router();
const jwt = require('jsonwebtoken');
const db= require('../database/maria');
db.connect();
const multer= require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, 'photo/')
    },
    filename: function(req, file, callback){
        callback(null, Date.now()+'-'+file.originalname)
    }
});

const upload= multer({
	storage:storage,
	limits:{
		files:10,
		fileSize: 1024*1024*5
	}
});

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
const addpost_nophoto= async function(req,res){
    //INSERT INTO posts() VALUES()...
   //project 정보 db에 저장하는코드
   
       const userid=req.body.userid;
       const title= req.body.title;
       const explained= req.body.explained;
       console.log(req.body);
       try{
           const data=await db.promise().query(`INSERT INTO posts(userid,title,explained) VALUES(${userid},'${title}','${explained}')`);
           res.json({status:"success"});
   
       }catch(e){
           
           console.log('addpost에서 error 발생!');
           console.log(e);
           res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
   
       }
   
   }

const addpost_onephoto =  async function(req,res){
 //INSERT INTO posts() VALUES()...
//project 정보 db에 저장하는코드
    //console.log("add");
    const photos = req.file;
    const userid=req.body.userid;
    const title= req.body.title;
    const explained= req.body.explained;
    
  
    console.log(req.file);
    try{
        const [data]=await db.promise().query(`INSERT INTO posts(userid,title,explained) VALUES(${userid},'${title}','${explained}')`);
        const insertid=data.insertId;
        console.log("파일 한 개 ");
        const photo_url=`/photo/${photos.filename}`;
        const [photo_data]= await db.promise().query(`INSERT INTO photos (postid,projid,url) VALUES(${insertid},NULL,'${photo_url}');`);
        
        res.json({status:"success"});
    }catch(e){
        console.log('addpost에서 error 발생!');
        console.log(e);
        res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
    }
};

const addpost_multiphoto=async function(req,res){
    //INSERT INTO posts() VALUES()...
   //project 정보 db에 저장하는코드
       //console.log("add");
    const photos = req.files;
    const userid=req.body.userid;
    const title= req.body.title;
    const explained= req.body.explained;
    
    
    console.log(req.files);
    try{
        const [data]=await db.promise().query(`INSERT INTO posts(userid,title,explained) VALUES(${userid},'${title}','${explained}')`);
        const insertid=data.insertId;
        console.log("파일 여러개 "+photos.length);
      
        photos.forEach( async(photo,idx)=> {
            const photo_url=`/photo/${photo.filename}`;
            console.log(photo_url);
            const [photo_data]= await db.promise().query(`INSERT INTO photos (postid,projid,url) VALUES(${insertid},NULL,'${photo_url}');`);
            if(idx==0){ // 첫번째 사진을 Thumbnail 이미지로 변경.
                await db.promise().query(`UPDATE photos SET thumbnail=1 WHERE url='${photo_url}';`);
            }
            
           
        
        })
        
        
        res.json({status:"success"});
    }catch(e){
        console.log('addpost에서 error 발생!');
        console.log(e);
        res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
    }
};

var editpost_nophoto= async function(req,res){

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
router.put("/edit/:id",editpost_nophoto);
//router.put("/edit/single/:id",editpost_one);
//router.put("/edit/multi/:id",editpost);
router.delete("/delete/:id",delpost);
router.post("/add",addpost_nophoto); //사진 없을 때
router.post("/add/single",upload.single("photo"),addpost_onephoto); //사진 1개
router.post("/add/multi",upload.array("photo"),addpost_multiphoto); //사진 2개 이상
module.exports = router;

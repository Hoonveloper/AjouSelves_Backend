const express = require('express');
const router =express.Router();
const jwt = require('jsonwebtoken');
const db= require('../database/maria');
const { verifyToken } = require("./middleware/tokenmiddleware");
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

var searchpostbytitle = async function(req,res){
    //검색을 통해 db에서 제목으로 검색
    //SELECT * FROM POSTS WHERE title = req.asdf 이런식으로 제목으로 검색
    const title =req.body.title;
    console.log(title);
 
    try{
        const [data] = await db.promise().query(`SELECT p.postid,p.title, p.explained, p.created_at, u.nickname, photos.url FROM posts AS p INNER JOIN users as u ON p.userid=u.userid INNER JOIN photos ON p.postid=photos.postid where title LIKE '%${title}%' AND photos.thumbnail=1;`);
        console.log(data);
        res.json(data);
    }catch{
        console.log('searchbytitle error 발생!');
        res.status(400).json({ status: "fail" });
    }
}

var getpost= async function(req,res){
     /*
    디테일한 post 정보 가져오는 코드 (댓글 포함)

    */
    const id = req.decoded._id;
    try{
        const [post]= await db.promise().query(`SELECT p.postid, u.nickname, p.title,p.explained, p.created_at FROM posts AS p JOIN users AS u ON p.userid=u.userid WHERE p.postid=${id};`);
        const [photos]= await db.promise().query(`SELECT * FROM photos WHERE postid=${id} ORDER BY thumbnail desc;`);
        console.log[photos];
        post[0].photos= new Array();
        photos.forEach((photo)=>{
            post[0].photos.push(photo.url);

        })
        console.log(post[0].title);
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
        res.send({status:"success",post});
    }catch{
        console.log('getpost에서 error 발생!');
        res.status(400).json({ status: "fail" });
    }

}

   
var getALLpost= async function(req,res){
   /*모든 project 정보 가져오는 코드
    SELECT * FROM posts ORDER BY created_ at (desc) -> 최신순
    SELECT * FROM posts ORDER BY created_ at (desc) -> 오래된순
    */

    try{
        const [data] = await db.promise().query(`SELECT p.postid,p.title, p.explained, p.created_at, u.userid, u.nickname , ph.url FROM posts as p join users as u ON p.userid=u.userid LEFT JOIN photos as ph ON ph.postid=p.postid AND ph.thumbnail =1 ORDER BY created_at DESC;`);
       
        //console.log(data);
        res.json(data);


    }catch(e){
        console.log(e);
        console.log('getALLpost에서 error 발생!');
        res.status(400).json({ status: "fail" });
    }
}
var addpost_nophoto= async function(req,res){
    //INSERT INTO posts() VALUES()...
   //project 정보 db에 저장하는코드
   
       const userid=req.decoded._id;
       const title= req.body.title;
       const explained= req.body.explained;
       console.log(req.body);
       try{
           const data=await db.promise().query(`INSERT INTO posts(userid,title,explained) VALUES(${userid},'${title}','${explained}')`);
           res.json({status:"success",text:"게시글 작성 완료"});
   
       }catch(e){
           
           console.log('addpost에서 error 발생!');
           console.log(e);
           res.status(400).json({ status: "fail" });
   
       }
   
   }

const addpost_onephoto =  async function(req,res){
 //INSERT INTO posts() VALUES()...
//project 정보 db에 저장하는코드
    //console.log("add");
    const photos = req.file;
    const userid=req.decoded._id;
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
        res.status(400).json({ status: "fail" });
    }
};

const addpost_multiphoto=async function(req,res){
    //INSERT INTO posts() VALUES()...
   //project 정보 db에 저장하는코드
       //console.log("add");
    const photos = req.files;
    const userid=req.decoded._id;
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
        
        
        res.json({status:"success",text:"게시글 작성 완료"});
    }catch(e){
        console.log('addpost에서 error 발생!');
        console.log(e);
        res.status(400).json({ status: "fail" });
    }
};

var editpost_nophoto= async function(req,res){

    const userid=req.decoded._id;
    const title= req.body.title;
    const explained= req.body.explained;
    
    //console.log(req.body);
    try{
        const [result] = await db.promise().query(`select userid from posts where postid=${postid}`);
        if(result[0].userid ==userid){
            const data= await db.promise().query(`UPDATE posts SET title='${title}', explained='${explained}' WHERE postid=${postid};`);
            res.json({status:"success",text:"글 수정이 완료되었습니다."});
        }
        else{
            res.json({status:"success", text:"글 작성자만 수정이 가능합니다."});
        }
        

    }catch{
        console.log('editpost에서 error 발생!');
        res.status(400).json({ status: "fail" });

    }
    

}
var editpost_onephoto = async function (req,res){
    const userid=req.decoded._id;
    const photos = req.file;
    const postid = req.params.id;
    const title= req.body.title;
    const explained= req.body.explained;
    const photo_url=`/photo/${photos.filename}`;
    try{
        const [result] = await db.promise().query(`select userid from posts where postid=${postid}`);
        if(result[0].userid ==userid){
            await db.promise().query(`DELETE FROM posts WHERE postid=${postid};`);
            //console.log(data);
            await db.promise().query(`DELETE from photos where postid=${postid};`); //본래 있던 사진 삭제. 
            await db.promise().query(`INSERT INTO photos(postid,projid,url,thumbnail) VALUES(${postid},NULL,'${photo_url}',1)`);
            await db.promise().query(`UPDATE posts SET title='${title}', explained='${explained}' WHERE postid=${postid};`);
            res.json({status:"success",text:"글 수정이 완료되었습니다."});
        }
        else{
            res.json({status:"success", text:"글 작성자만 수정이 가능합니다."});
        }
    }catch(e){
        console.log(e);
        console.log('editpost에서 error 발생!');
        res.status(400).json({ status: "fail" });
    }
}

var editpost_multiphoto = async function(req,res){
    const userid=req.decoded._id;
    const photos = req.files;
    const postid = req.params.id;
    const title= req.body.title;
    const explained= req.body.explained;
    try{
        const [result] = await db.promise().query(`select userid from posts where postid=${postid}`);
        if(result[0].userid ==userid){
            await db.promise().query(`DELETE from photos where postid=${postid};`); //본래 있던 사진 삭제. 
            photos.forEach( async(photo,idx)=> {
                const photo_url=`/photo/${photo.filename}`;
                console.log(photo_url);
                await db.promise().query(`INSERT INTO photos (postid,projid,url) VALUES(${postid},NULL,'${photo_url}');`);
                if(idx==0){ // 첫번째 사진을 Thumbnail 이미지로 변경.
                    await db.promise().query(`UPDATE photos SET thumbnail=1 WHERE url='${photo_url}';`);
                }
            })
            const data= await db.promise().query(`UPDATE posts SET title='${title}', explained='${explained}' WHERE postid=${postid};`);
            res.json({status:"success",text:"글 수정이 완료되었습니다."});

        }
        else{
            res.json({status:"success", text:"글 작성자만 수정이 가능합니다."});

        }
        

    }catch(e){
        console.log(e);
        console.log('editpost에서 error 발생!');
        res.status(400).json({ status: "fail" });
    }



}

var delpost = async function(req,res){
    const postid = req.params.id;
    const userid=req.decoded._id;
    try{
        const [result] = await db.promise().query(`select userid from posts where postid=${postid}`);
        if(result[0].userid ==userid){
            const data =await db.promise().query(`DELETE FROM posts WHERE postid=${postid};`);
            //console.log(data);
            res.json({status:"success", text:"글 삭제를 성공했습니다."});

        }
        else{
            res.json({status:"success", text:"글 작성자만 삭제가 가능합니다.."});

        }

        const data =await db.promise().query(`DELETE FROM posts WHERE postid=${postid};`);
        //console.log(data);
        res.json({status:"success", text:"글 삭제를 성공했습니다."});
    }catch{
        console.log('delpost에서 error 발생!');
        res.status(400).json({ status: "fail" });
    }
}


router.post("/search",searchpostbytitle);
router.get("/all",getALLpost);
router.get("/:id",verifyToken,getpost);
router.put("/edit/:id",verifyToken,editpost_nophoto);
router.put("/edit/multi/:id",verifyToken,upload.array("photo"),editpost_multiphoto);
router.delete("/delete/:id",verifyToken,delpost);
router.post("/add",verifyToken,addpost_nophoto); //사진 없을 때
router.post("/add/multi",verifyToken,upload.array("photo"),addpost_multiphoto); //사진 2개 이상
module.exports = router;

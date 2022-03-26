const { response } = require('express');



var searchpostbytitle = async function(req,res){
    //검색을 통해 db에서 제목으로 검색
    //SELECT * FROM POSTS WHERE title = req.asdf 이런식으로 제목으로 검색
    const title =req.body.title;
    console.log(title);
    const db=req.app.get('database');
    try{
        const [data] = await db.db.query(`SELECT p.postID,p.title, p.explained, p.created_at, u.NICKNAME FROM post AS p JOIN user as u ON p.userID=u.userid where title LIKE '%${title}%';`);
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

    const db=req.app.get('database'); 
    try{
        const [post]= await db.db.query(`SELECT p.postID, u.NICKNAME, p.title,p.explained, p.created_at FROM post AS p JOIN user AS u ON p.userID=u.userID WHERE p.postID=${id};`);
        post.comments=new Array();
        const [comments]= await db.db.query(`SELECT * FROM comments WHERE postid=${id}`);
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

    const db=req.app.get('database');
    try{
        const [data] = await db.db.query(`SELECT p.title, p.explained, p.created_at, u.userid, u.NICKNAME FROM post as p join user as u ON p.userID=u.userid ORDER BY created_at DESC`);
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
    const db=req.app.get('database');
    const userid=req.body.userid;
    const title= req.body.title;
    const explained= req.body.explained;
    console.log(req.body);
    try{
        const data=await db.db.query(`INSERT INTO post(userID,title,explained) VALUES(${userid},'${title}','${explained}')`);
        res.json({status:"success"});

    }catch{
        console.log('addpost에서 error 발생!');
        res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });

    }

}


var editpost= async function(req,res){
    const db=req.app.get('database');
    const postid = req.params.id;
    const title= req.body.title;
    const explained= req.body.explained;
    console.log(req.body);
    try{
        const data= await db.db.query(`UPDATE post SET title='${title}', explained='${explained}' WHERE postId=${postid};`);
        res.json({text:"success"});

    }catch{
        console.log('editpost에서 error 발생!');
        res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });

    }
    

}

var delpost = async function(req,res){
    const db=req.app.get('database');
    const postid = req.params.id;
    try{
        const data =await db.db.query(`DELETE FROM post WHERE postID=${postid};`);
        console.log(data);
        res.json({text:"success"});
    }catch{
        console.log('editpost에서 error 발생!');
        res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
    }
}

module.exports.searchpostbytitle=searchpostbytitle;
module.exports.getpost=getpost;
module.exports.getALLpost=getALLpost;
module.exports.addpost=addpost;
module.exports.editpost=editpost;
module.exports.delpost=delpost;

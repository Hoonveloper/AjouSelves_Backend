const { response } = require('express');


var searchByTitle = function(req,res){
    //검색을 통해 db에서 제목으로 검색

    //SELECT * FROM POSTS WHERE title = req.asdf 이런식으로 제목으로 검색

    console.log("searchpost 실행");
    
    
    const title = req.body.title;
    console.log(req.body.title);
    const db=req.app.get('database');
    db.db.query(`SELECT * FROM post where title Like '%${title}%';`,function(err,response){
       
        if(!err){

            console.log("정상작동");
            console.log(response);
            res.send(response);
           
        }
        else{
            console.log('searchbytitle error 발생!');
            res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
        }
    })


    
    

}

var getpost=function(req,res){
     /*모든 project 정보 가져오는 코드
    SELECT * FROM posts ORDER BY created_ at (desc) -> 최신순
    SELECT * FROM posts ORDER BY created_ at (desc) -> 오래된순
    */
   
    console.log("get post 실행");
    const id = req.params.id;
    console.log(id);
    const db=req.app.get('database');
    db.db.query(`SELECT * FROM post where postID=${id}`,function(err,response){
       
        if(!err){

            console.log("정상작동");
            //console.log(response);
            res.send(response);
           
        }
        else{
            console.log('getpost에서 error 발생!');
            res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
        }
    })

    console.log("zzz");
    
    

}
   
var getALLpost= function(req,res){
   /*모든 project 정보 가져오는 코드
    SELECT * FROM posts ORDER BY created_ at (desc) -> 최신순
    SELECT * FROM posts ORDER BY created_ at (desc) -> 오래된순
    */

    const db=req.app.get('database');
    db.db.query('SELECT * FROM post ORDER BY created_at DESC',function(err,response){
        console.log('getALLpost실행.');
        if(!err){
            console.log("정상작동");
            //console.log(response);
            res.send(response);
           
        }
        else{
            console.log('getALLpost에서 error 발생!');
            res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
        }
    })



}

var addpost= function(req,res){
 //INSERT INTO posts() VALUES()...
//project 정보 db에 저장하는코드
    const db=req.app.get('database');
    const userid=req.body.userid;
    const title= req.body.title;
    const explained= req.body.explained;
    console.log(req.body);
    db.db.query(`INSERT INTO post(userID,title,explained) VALUES(${userid},'${title}','${explained}');`,function(err,response){
        console.log('addpost실행.');
        if(!err){
            console.log("정상작동");
            console.log(response.affectedRows);
            const postid= response.insertId;
            res.status(200).redirect(`/post/get/:${insertId}`);
           
        }
        else{
            console.log('addpost에서 error 발생!');
            res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
        }
    })

}

var editpost= function(req,res){
    const db=req.app.get('database');
    const postid = req.params.id;
    const title= req.body.title;
    const explained= req.body.explained;
    console.log(req.body);
    db.db.query(`UPDATE post SET title='${title}', explained='${explained}' WHERE postId=${postid};`,function(err,response){
        console.log('editpost실행.');
        if(!err){
            console.log("정상작동");
            console.log(response);
            
           res.status(200).redirect(`/post/get/${postid}`);
           
        }
        else{
            console.log('editpost에서 error 발생!');
            res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
        }
    })

}

var delpost = function(req,res){
    const db=req.app.get('database');
    const postid = req.params.id;
    
 
    db.db.query(`DELETE FROM post WHERE postID=${postid};`,function(err,response){
        console.log('delete post실행.');
        if(!err){
            console.log("정상작동");
            console.log(response);
            
           res.status(200).redirect(`/post/getall`);
           
        }
        else{
            console.log('editpost에서 error 발생!');
            res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
        }
    })
   

}

module.exports.searchByTitle=searchByTitle;
module.exports.getpost=getpost;
module.exports.getALLpost=getALLpost;
module.exports.addpost=addpost;
module.exports.editpost=editpost;
module.exports.delpost=delpost;
const express = require('express');
const router =express.Router();
const jwt = require('jsonwebtoken');
const db= require('../database/maria');
db.connect();

const addComment = async function(req,res){
    const projid= req.body.projid || "NULL";
    const postid = req.body.postid || "NULL";
    const userid= req.body.userid;
    const comment= req.body.comment;
    if (!comment){
        console.log("zz");
        res.status(400).json({status:"fail",text:"댓글을 입력해주세요!"});

    }
    //console.log(projid, postid);
    try{

    const [data]=await db.promise().query(`INSERT INTO comments(postid,userid,projid,comments) VALUES (${postid}, ${userid},${projid},'${comment}')`);
    //console.log(data);
    res.json({status:"success"});
    }catch{

        console.log('댓글 추가 중 error 발생!');
        res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
    }

};

const editComment = async function(req,res){
    const id= req.params.id;
    const comment = req.body.comment;
    if (!comment){
        console.log("zz");
        res.status(400).json({status:"fail",text:"수정할 댓글을 입력해주세요!"});

    }
    try{
        const [data]=await db.promise().query(`UPDATE comments SET comments='${comment}'WHERE commentid=${id};` );
     
        res.json({status:"success"});

    }catch{
        console.log('댓글 수정 중 error 발생!');
        res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });


    }



};
const deleteComment= async function(req,res){
    const id= req.params.id;
    try{
        const [data] =await db.promise().query(`DELETE FROM comments WHERE commentid=${id};`);
        res.json({status:"success"});

    }catch{
        console.log('댓글 삭제 중 error 발생!');
        res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
        
    }

}

router.post('/add',addComment);
router.put('/edit/:id' , editComment);
router.delete('/delete/:id',deleteComment);
module.exports=router;
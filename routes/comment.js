const express = require('express');
const router =express.Router();
const jwt = require('jsonwebtoken');
const db= require('../database/maria');
const { verifyToken } = require("./middleware/tokenmiddleware");
db.connect();

const addComment = async function(req,res){
    const projid= req.params.projid || "NULL";
    const postid = req.params.postid || "NULL";
    const userid= req.decoded._id;
    const comment= req.body.comment;
    if (!comment){
        console.log("zz");
        res.status(400).json({status:"fail",text:"댓글을 입력해주세요"});

    }
    //console.log(projid, postid);
    try{

    const [data]=await db.promise().query(`INSERT INTO comments(postid,userid,projid,comments) VALUES (${postid}, ${userid},${projid},'${comment}')`);
    //console.log(data);
    res.json({status:"success",text:"댓글 작성을 완료하였습니다."});
    }catch{

        console.log('댓글 추가 중 error 발생!');
        res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
    }

};

const editComment = async function(req,res){
    const userid= req.decoded._id;
    const conmment_id= req.params.commentid;
    const comment = req.body.comment;
    if (!comment){
        res.status(400).json({status:"fail",text:"수정할 댓글을 입력해주세요!"});
    }
    try{
        const [result] = await db.promise.query(`SELECT userid from comments where commentid=${conmment_id}`);
        if (result[0].userid!=userid) res.status(400).json({status:"fail",text:"댓글 작성자만 수정이 가능합니다."});
        else{
            await db.promise().query(`UPDATE comments SET comments='${comment}'WHERE commentid=${id};` );
            res.json({status:"success", text:"댓글 수정을 완료하였습니다."});
        }
    }catch{
        console.log('댓글 수정 중 error 발생!');
        res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });


    }



};
const deleteComment= async function(req,res){
    const id= req.params.commentid;
    const userid= req.decoded._id;
    try{
        const [result] = await db.promise.query(`SELECT userid from comments where commentid=${conmment_id}`);
        if (result[0].userid!=userid) res.status(400).json({status:"fail",text:"댓글 작성자만 삭제가 가능합니다."});
        else{

            const [data] =await db.promise().query(`DELETE FROM comments WHERE commentid=${id};`);
            res.json({status:"success",text:"댓글 삭제를 완료하였습니다."});
    
        }
       
    }catch{
        console.log('댓글 삭제 중 error 발생!');
        res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
        
    }

}

router.post('/add',verifyToken,addComment);
router.put('/edit/:id' ,verifyToken, editComment);
router.delete('/delete/:id',verifyToken,deleteComment);
module.exports=router;
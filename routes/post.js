var searchpost = function(req,res){
    //검색을 통해 db에서 제목으로 검색

    //SELECT * FROM POSTS WHERE title = req.asdf 이런식으로 제목으로 검색
    

}

var getpost= function(req,res){
    //특정한 project 정보 가져오는 코드
    //SELECT * FROM posts WHERE postid=id
}
   
var getALLpost= function(req,res){

    
//모든 project 정보 가져오는 코드
//SELECT * FROM posts ORDER BY created_ at (desc) -> 최신순
//SELECT * FROM posts ORDER BY created_ at (desc) -> 오래된순


}

var addpost= function(req,res){

//INSERT INTO posts() VALUES()...
//project 정보 db에 저장하는코드
}

var editpost= function(req,res){

//project 정보 수정하여 db에 저장하는코드


    
}

var delpost = function(req,res){

//project 정보 삭제
//


}

module.exports.getpost=getpost;
module.exports.getALLpost=getALLpost;
module.exports.addpost=addpost;
module.exports.editpost=editpost;
module.exports.delpost=delpost;
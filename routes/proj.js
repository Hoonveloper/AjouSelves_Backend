var searchprojbytitle= function(req,res){
  //SELECT * FROM proj WHERE title = req.asdf 이런식으로 제목으로 검색

}


var getproj= function(req,res){
 //특정한 project 정보 가져오는 코드


}

var getALLproj= function(req,res){


//모든 project 정보 가져오는 코드
}

var addproj= function(req,res){


//project 정보 db에 저장하는코드
}

var editproj= function(req,res){

//project 정보 수정하여 db에 저장하는코드

    
}

var delproj = function(req,res){

//project 정보 삭제


}

module.exports.searchproj=searchproj;
module.exports.getproj=getproj;
module.exports.getALLproj=getALLproj;
module.exports.addproj=addproj;
module.exports.editproj=editproj;
module.exports.delproj=delproj;

var kakao = function(req,res){


    //카카오 로그인 코드
    // access 토큰 발급받아서 카카오한테 정보 얻고 jwt토큰 res에 담아서 넘겨주기.
}
var local = function (req,res){
    //로컬 로그인 코드
    // 비밀번호 암호화 후 db에 있는 암호랑 비교 후 맞다면 jwt토큰 발급
    // 비교 후 틀리다면 로그인 실패



}


module.exports.kakao=kakao;
module.exports.local=local;
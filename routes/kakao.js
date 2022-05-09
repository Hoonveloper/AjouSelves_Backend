const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const DB = require("../database/maria"); // DB 정보 가져오기
require("dotenv").config(); // jwt secret key 가져오기
DB.connect();

//body-parser
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.get("/test", (req, res) => {
  const base = "https://kauth.kakao.com/oauth/authorize";
  const config = {
    client_id: process.env.client_id,
    redirect_uri: process.env.redirect_uri,
    response_type: "code",
  };
  const full = new URLSearchParams(config).toString();
  const result = `${base}?${full}`;
  console.log(result);
  res.redirect(result);
});

router.get("/auth", (req, res) => {
  console.log(req.query.code);
  res.json(req.query.code);
});

router.get("/url", (req, res) => {
  res.redirect(`https://kauth.kakao.com/oauth/authorize?`);
});

// const finishKakaoLogin = async (req, res) => {
//   const baseUrl = "https://kauth.kakao.com/oauth/token";
//   const config = {
//     client_id: process.env.KAKAO_CLIENT,
//     client_secret: process.env.KAKAO_SECRET,
//     grant_type: "authorization_code",
//     redirect_uri: "http://localhost:4002/users/kakao/finish",
//     code: req.query.code,
//   };
//   const params = new URLSearchParams(config).toString();
//   const finalUrl = `${baseUrl}?${params}`;
//   const kakaoTokenRequest = await fetch(finalUrl, {
//     method: "POST",
//     headers: {
//       "Content-type": "application/json", // 이 부분을 명시하지않으면 text로 응답을 받게됨
//     },
//   });
//   const json = await kakaoTokenRequest.json();
//   console.log(json);
//   res.send(JSON.stringify(json)); // 프론트엔드에서 확인하려고
// };

//https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code HTTP/1.1

//https://kauth.kakao.com/oauth/authorize?client_id=bf04db6bfc971a8c24f54cafeb59c73c&redirect_uri=https://localhost:3000/auth/kakao&response_type=code

https: module.exports = router;

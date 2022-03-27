const express = require("express");
const router = express.Router();
const path = require("path");

// 기본 홈페이지 불러오기
router.get("/", (req,res) => {
	res.sendFile(path.join(__dirname,'../index.html'));
})

module.exports = router;
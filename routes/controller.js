const express = require("express");
const router = express.Router();

const post = require("./post");
const proj = require("./proj");
const user = require("./user");
const auth = require("./auth");
const comment = require("./comment");
const kakao = require("./kakao");

router.use("/post", post);
router.use("/proj", proj);
router.use("/user", user);
router.use("/auth", auth);
router.use("/comment", comment);
router.use("/kakao", kakao);

module.exports = router;

const express = require("express");
const router = express.Router();
const DB = require("../../database/maria"); // DB 정보 가져오기
const crypto = require("crypto");

//body-parser
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

exports.verifypassword = async (req, res, next) => {
  const email = req.body.email;
  const pw = req.body.password;
  try {
    const [data] = await DB.promise().query(
      `select salt, password from users where email = ?`,
      email
    );
    const db_salt = data[0].salt;
    const db_pw = data[0].password;
    const req_pw = [
      crypto.pbkdf2Sync(pw, db_salt, 9999, 64, "sha512").toString("base64"),
    ];
    if (req_pw == db_pw) {
      next();
    } else {
      res
        .status(400)
        .json({ status: "fail", text: "비밀번호가 일치하지 않습니다." });
    }
  } catch (e) {
    res
      .status(400)
      .json({
        status: "fail",
        text: "비밀번호 검증에 실패했습니다.",
        error: e,
      });
  }
};

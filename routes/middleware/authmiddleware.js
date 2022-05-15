const express = require("express");
const router = express.Router();
const crypto = require("crypto");

//body-parser
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

module.exports = {
  generateRandom: () => {
    try {
      const max = 999999;
      const min = 111111;
      const ranNum = Math.floor(Math.random() * (max - min + 1)) + min;
      return ranNum;
    } catch (error) {
      console.log("난수생성에 실패했습니다." + error);
    }
  },

  createHashedPassword: (plainPassword) => {
    try {
      const salt = crypto.randomBytes(64).toString("base64");
      return [
        crypto
          .pbkdf2Sync(plainPassword, salt, 9999, 64, "sha512")
          .toString("base64"),
        salt,
      ];
    } catch (error) {
      console.log("비밀번호 암호화에 실패했습니다." + error);
    }
  },
};

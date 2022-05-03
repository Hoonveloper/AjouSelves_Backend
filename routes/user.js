const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { verifyToken } = require("./authmiddleware");
const DB = require("../database/maria"); // DB 정보 가져오기
DB.connect();

//body-parser
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// user의 고유 id를 받아 user의 정보 db에서 보내준다.
router.get("/", verifyToken, (req, res) => {
  const userid = req.decoded._id;
  DB.query(
    `select *from users where userid = ?`,
    userid,
    (err, result, fileds) => {
      if (err) {
        console.log("user get fail");
        res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
      } else {
        console.log("user get success");
        res.json(result);
      }
    }
  );
});

// 모든 user의  정보를 보내준다. 임시로 만들어봄
router.get("/all", (req, res) => {
  DB.query("select *from users where userid > 1", (err, result, fileds) => {
    if (err) {
      console.log("all user get fail");
      res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
    } else {
      console.log("all user get success");
      res.json(result);
    }
  });
});

// user의 고유아이디를 받아 DB에서 관련된 모든 정보를 삭제한다.(회원탈퇴)
// url에 id를 받을지 아니면 값으로 요청받을지 고민이 필요해보인다.
router.delete("/", verifyToken, (req, res) => {
  const userid = req.decoded._id;
  DB.query(
    `delete from users where userid =?`,
    userid,
    (err, result, fileds) => {
      if (err) {
        console.log("user delete fail");
        res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
      } else {
        console.log("user delete success");
        res.json({ status: "success" });
      }
    }
  );
});

// 수정할 값들과 고유아이디를 받아 값들을 수정해준다.
router.put("/", verifyToken, (req, res) => {
  const userid = req.decoded._id;
  const phonenumber = req.body.phonenumber;
  const nickname = req.body.nickname;
  const birth = req.body.birth;
  const address = req.body.address;
  const account = req.body.account;

  DB.query(
    `update users set phonenumber = '${phonenumber}', nickname = '${nickname}', birth = '${birth}', address = '${address}', account = '${account}' where userid = ?`,
    userid,
    (err, result, fileds) => {
      if (err) {
        console.log("user edit fail");
        res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
      } else {
        console.log("user edit success");
        res.json({ status: "success" });
      }
    }
  );
});

router.put("/paylink", verifyToken, function (req, res) {
  const userid = req.decoded._id;
  const pay_link = req.body.paylink;
  DB.query(
    `update users set paylink = '${pay_link}' where userid = ?`,
    userid,
    (err, result, fileds) => {
      if (err) {
        console.log("paylink post fail");
        res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
      } else {
        console.log("paylink post success");
        res.json({ status: "success" });
      }
    }
  );
});

// 참여 굿즈 title 가져오기
router.get("/attend", verifyToken, (req, res) => {
  const userid = req.decoded._id;
  DB.query(
    `select projid from participants where userid=?`,
    userid,
    (err, result, fields) => {
      const attend_proj = result.map((v) => v.projid);
      console.log(attend_proj);
      DB.query(
        `select title from projs where projid in (${attend_proj})`,
        (err, result, fields) => {
          console.log(result);
          res.json(result);
        }
      );
    }
  );
});

// 제작 굿즈 title 가져오기
router.get("/create", verifyToken, (req, res) => {
  const userid = req.decoded._id;
  DB.query(
    `select projid from projs where userid=?`,
    userid,
    (err, result, fileds) => {
      const create_proj = result.map((v) => v.projid);
      console.log(create_proj);
      DB.query(
        `select title from projs where projid in (${create_proj})`,
        (err, result, fields) => {
          const title_proj = result;
          console.log(title_proj);
          res.json(title_proj);
        }
      );
    }
  );
});

// 참여 굿즈 detail 가져오기
router.get("/attend_detail", verifyToken, (req, res) => {
  const userid = req.decoded._id;
  DB.query(
    `select projid from participants where userid=?`,
    userid,
    (err, result, fileds) => {
      const create_proj = result.map((v) => v.projid);
      console.log(create_proj);
      DB.query(
        `select *from projs where projid in (${create_proj})`,
        (err, result, fields) => {
          const title_proj = result;
          console.log(title_proj);
          res.json(title_proj);
        }
      );
    }
  );
});

// 제작 굿즈 detail 가져오기
router.get("/create_detail", verifyToken, (req, res) => {
  const userid = req.decoded._id;
  DB.query(
    `select projid from projs where userid=?`,
    userid,
    (err, result, fileds) => {
      const create_proj = result.map((v) => v.projid);
      console.log(create_proj);
      DB.query(
        `select *from projs where projid in (${create_proj})`,
        (err, result, fields) => {
          const title_proj = result;
          console.log(title_proj);
          res.json(title_proj);
        }
      );
    }
  );
});

module.exports = router;

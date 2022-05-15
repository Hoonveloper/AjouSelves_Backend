const express = require("express");
const router = express.Router();
const crypto = require("crypto"); // 비밀번호 암호화 모듈
const { verifyToken } = require("./middleware/tokenmiddleware"); // Token 검증 미들웨어

const DB = require("../database/maria"); // DB 정보 가져오기
DB.connect(); // DB 연결

//body-parser
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// mypage에서 회원정보 수정 또는 조회를 위해 회원정보를 가져오는 API
router.get("/", verifyToken, (req, res) => {
  const userid = req.decoded._id;
  DB.query(
    `select email,name,phonenumber,nickname,status,birth,address,account,profilelink from users where userid = ?`,
    userid,
    (err, result, fileds) => {
      if (err) {
        console.log("user get fail");
        res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
      } else {
        console.log("user get success");
        res.status(200).json(result);
      }
    }
  );
});

// 모든 user의 회원정보를 얻어온다. 개발을 위해 임시로 구현한 API
router.get("/all", (req, res) => {
  DB.query(
    "select email,name,phonenumber,nickname,status,birth,address,account,profilelink from users where userid > 1",
    (err, result, fileds) => {
      if (err) {
        console.log("all user get fail");
        res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
      } else {
        console.log("all user get success");
        res.status(200).json(result);
      }
    }
  );
});

// mypage에서 회원탈퇴를 진행할때 DB에서 삭제하는 API
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
        res.status(200).json({ status: "success" });
      }
    }
  );
});

// 회원정보 수정을 위한 API.
router.put("/", verifyToken, (req, res) => {
  const userid = req.decoded._id;
  const phonenumber = req.body.phonenumber;
  const nickname = req.body.nickname;
  const status = req.body.status;
  const birth = req.body.birth;
  const address = req.body.address;
  const account = req.body.account;
  const profilelink = req.body.profilelink;

  DB.query(
    `update users set phonenumber = '${phonenumber}', nickname = '${nickname}', status = '${status}', birth = '${birth}', address = '${address}', account = '${account}', profilelink = '${profilelink}' where userid = ?`,
    userid,
    (err, result, fileds) => {
      if (err) {
        console.log("user edit fail");
        res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
      } else {
        console.log("user edit success");
        res.status(200).json({ status: "success" });
      }
    }
  );
});

// QR결제링크를 마이페이지에서도 등록할 수 있게 하는 API.
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
        res.status(200).json({ status: "success" });
      }
    }
  );
});

// 참여 굿즈 title 정보 가져오기
router.get("/join", verifyToken, (req, res) => {
  const userid = req.decoded._id;
  DB.query(
    `select projid from participants where userid=?`,
    userid,
    (err, result, fields) => {
      if (err) {
        console.log("유저가 참가한 프로젝트가 없습니다.");
        res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
      } else if (result.length === 0) {
        console.log("유저가 참가한 프로젝트가 없습니다.");
        res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
      } else {
        const attend_proj = result.map((v) => v.projid);
        DB.query(
          `select projid,title from projs where projid in (${attend_proj})`,
          (err, result, fields) => {
            if (err) {
              console.log("title을 불러오는 중 error 발생");
              res
                .status(400)
                .json({ text: "ErrorCode:400, 잘못된 요청입니다." });
            } else {
              console.log("get join title success");
              res.status(200).json(result);
            }
          }
        );
      }
    }
  );
});

// 제작 굿즈 title 정보 가져오기
router.get("/create", verifyToken, (req, res) => {
  const userid = req.decoded._id;
  DB.query(
    `select projid from projs where userid=?`,
    userid,
    (err, result, fileds) => {
      if (err) {
        res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
      } else if (result.length === 0) {
        console.log("유저가 생성한 프로젝트가 없습니다.");
        res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
      } else {
        const create_proj = result.map((v) => v.projid);
        console.log(create_proj);
        DB.query(
          `select title from projs where projid in (${create_proj})`,
          (err, result, fields) => {
            if (err) {
              console.log("title을 불러오는 error 발생");
              res
                .status(400)
                .json({ text: "ErrorCode:400, 잘못된 요청입니다." });
            } else {
              console.log("get create title success");
              res.status(200).json(result);
            }
          }
        );
      }
    }
  );
});

// 참여 굿즈 detail 정보 가져오기
router.get("/join-detail", verifyToken, (req, res) => {
  const userid = req.decoded._id;
  DB.query(
    `select projid from participants where userid=?`,
    userid,
    (err, result, fileds) => {
      if (err) {
        console.log("유저가 참가한 프로젝트가 없습니다.");
        res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
      } else if (result.length === 0) {
        console.log("유저가 참가한 프로젝트가 없습니다.");
        res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
      } else {
        const create_proj = result.map((v) => v.projid);
        DB.query(
          `select *from projs where projid in (${create_proj})`,
          (err, result, fields) => {
            if (err) {
              console.log("detail을 불러오는 중 error 발생");
              res
                .status(400)
                .json({ text: "ErrorCode:400, 잘못된 요청입니다." });
            } else {
              console.log("get join detail success");
              res.status(200).json(result);
            }
          }
        );
      }
    }
  );
});

// 제작 굿즈 detail 정보 가져오기
router.get("/create-detail", verifyToken, (req, res) => {
  const userid = req.decoded._id;
  DB.query(
    `select projid from projs where userid=?`,
    userid,
    (err, result, fileds) => {
      if (err) {
        console.log("유저가 생성한 프로젝트가 없습니다.");
        res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
      } else if (result.length === 0) {
        console.log("유저가 생성한 프로젝트가 없습니다.");
        res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
      } else {
        const create_proj = result.map((v) => v.projid);
        DB.query(
          `select *from projs where projid in (${create_proj})`,
          (err, result, fields) => {
            if (err) {
              console.log("detail을 불러오는 중 error 발생");
              res
                .status(400)
                .json({ text: "ErrorCode:400, 잘못된 요청입니다." });
            } else {
              console.log("get create detail success");
              res.status(200).json(result);
            }
          }
        );
      }
    }
  );
});

module.exports = router;

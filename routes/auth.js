const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const DB = require("../database/maria"); // DB 정보 가져오기
const { smtpTransport } = require("../config/email");
require("dotenv").config(); // jwt secret key 가져오기
const { verifyToken } = require("./authmiddleware");

//body-parser
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

//인증번호 생성함수.
const generateRandom = function (min, max) {
  var ranNum = Math.floor(Math.random() * (max - min + 1)) + min;
  return ranNum;
};

// 비밀번호 암호화(crypto, salt 사용)
function createHashedPassword(plainPassword) {
  const salt = crypto.randomBytes(64).toString("base64");
  return [
    crypto
      .pbkdf2Sync(plainPassword, salt, 9999, 64, "sha512")
      .toString("base64"),
    salt,
  ];
}

// 회원가입 형식에 맞는 json 파일을 받아 이를 user db에 넣어준다.
router.post("/register", async function (req, res) {
  const body = req.body;
  const encryption = createHashedPassword(body.password);
  const userquery =
    "insert into users (email, password, salt, name, phonenumber, nickname, status, socialtype, sex, birth, address, account, profilelink) values (?,?,?,?,?,?,?,?,?,?,?,?,?)";
  const salt = encryption[1];
  const password = encryption[0];
  const uservalue = [
    body.email,
    password,
    salt,
    body.name,
    body.phonenumber,
    body.nickname,
    body.status,
    body.socialtype,
    body.sex,
    body.birth,
    body.address,
    body.account,
    body.profilelink,
  ];
  DB.query(userquery, uservalue, (err, result, fileds) => {
    if (err) {
      console.log("user register fail");
      console.log(err);
      res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
    } else {
      console.log("user register success");
      res.json({ status: "success" });
    }
  });
});

const emailVerification = async function (req, res) {
  const email = req.body.email;
  const number = generateRandom(111111, 999999);
  const mailoptions = {
    from: "ajouselves@naver.com",
    to: email,
    subject: "[Goods By us] 인증 관련 메일입니다.",
    text: "오른쪽 숫자 6자리를 입력해주세요 : " + number,
  };

  try {
    const [data] = await DB.promise().query(
      `select email from users where email = '${email}'`
    );
    console.log(data);
    if (Object.keys(data).length === 0) {
      //이메일 verification 코드
      const result = await smtpTransport.sendMail(
        mailoptions,
        (error, response) => {
          if (error) {
            console.log(error);
            return res.status(400).send({ status: "이메일 오류" });
          } else {
            /* 클라이언트에게 인증 번호를 보내서 사용자가 맞게 입력하는지 확인! */
            return res.status(200).send({
              number: number,
            });
          }
          smtpTransport.close();
        }
      );
    } else {
      //이미 존재하는 유저.
      res.json({ status: "email duplicate" });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
  }
};

//비밀번호 일치 확인 미들웨어
const passwordverify = async function (req, res, next) {
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
      console.log("비밀번호 일치");
      next();
    } else {
      console.log("비밀번호가 일치하지 않습니다.");
      res.json({ status: "fail" });
    }
  } catch (e) {
    console.log("Password verify error");
    res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
  }
};

// email 중복 여부 확인
router.get("/verifyid", (req, res) => {
  const req_email = req.body.email;
  DB.query(
    `select email from users where email = ?`,
    req_email,
    (err, result, fields) => {
      if (err) {
        console.log("유저 이메일이 없습니다.");
        res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
      } else {
        if (result[0] == undefined) {
          console.log("이 이메일은 사용 가능합니다.");
          res.json({ status: "success" });
        } else {
          const idverify = result[0].email;
          if (req_email == idverify) {
            console.log("이메일이 중복됩니다. 다른 이메일을 입력해주세요");
            res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
          } else {
            console.log("이 이메일은 사용 가능합니다.");
            res.json({ status: "success" });
          }
        }
      }
    }
  );
});

/*  
    user login 처리
    login 처리를 하게 되면 먼저 검증을 한다. 아이디 패스워드가 맞는지
    맞다면 userid를 페이로드에 담아 토큰을 전달한다.
    토큰을 받게 되면 그 userid로 필요한 정보를 받는다.
*/

router.post("/login", passwordverify, async (req, res) => {
  const { email, password } = req.body;
  try {
    const [data] = await DB.promise().query(
      `select userid from users where email=?`,
      email
    );
    const user_id = data[0].userid;

    const token = jwt.sign(
      {
        _id: user_id,
        _email:email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
        issuer: "AjouSelves_Back",
      }
    );

    console.log("Login success");
    res.json({
      code: 200,
      message: "토큰이 발급되었습니다.",
      token: token,
    });
  } catch (e) {
    console.log("login error");
    res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
  }
});

router.get("/token-test", verifyToken, (req, res) => {
  const user_id = req.decoded._id;
  console.log("Token is ok");
  res.status(200).json({
    code: 200,
    message: "토큰은 정상입니다.",
    data: {
      _id: user_id,
    },
  });
});

router.post("/email", emailVerification);
module.exports = router;

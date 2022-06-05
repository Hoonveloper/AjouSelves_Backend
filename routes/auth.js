const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken"); // jwt 모듈
require("dotenv").config(); // jwt secret key value

const { smtpTransport } = require("../config/email"); // email 인증을 위한 사용자 정보
const { verifyToken } = require("./middleware/tokenmiddleware"); // Token 검증 미들웨어
const { verifypassword } = require("./middleware/passmiddleware"); // Password 검증 미들웨어
const authmiddleware = require("./middleware/authmiddleware");
const DB = require("../database/maria"); // DB 정보 가져오기
DB.connect();

//body-parser
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// 회원가입 형식에 맞는 json 파일을 받아 이를 user db에 넣어준다.
router.post("/register", async function (req, res) {
  const body = req.body;
  const encryption = authmiddleware.createHashedPassword(req.body.password);
  const userquery =
    "insert into users (email, password, salt, name, phonenumber, nickname, status, sex, birth, address, account) values (?,?,?,?,?,?,?,?,?,?,?)";
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
   
    body.sex,
    body.birth,
    body.address,
    body.account,
    
  ];
  DB.query(userquery, uservalue, (err, result, fileds) => {
    if (err) {
      res
        .status(400)
        .json({ status: "fail", text: "회원가입에 실패했습니다.", error: err });
    } else {
      res.status(200).json({
        status: "success",
        text: "정상적으로 회원가입에 성공했습니다.",
      });
    }
  });
});

router.post("/email", async function (req, res) {
  const email = req.body.email;
  const number = authmiddleware.generateRandom();
  const mailoptions = {
    from: "ajouselves@naver.com",
    to: email,
    subject: "[Goods By us] 인증 메일입니다.",
    text: "인증번호 6자리를 입력해주세요 : " + number,
  };

  try {
    const [data] = await DB.promise().query(
      `select email from users where email = '${email}'`
    );
    if (Object.keys(data).length === 0) {
      //이메일 verification 코드
      const result = await smtpTransport.sendMail(
        mailoptions,
        (error, response) => {
          if (error) {
            return res.status(400).send({
              status: "fail",
              text: "이메일 인증 실패 ",
              error: error,
            });
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
      res.status(400).json({
        status: "fail",
        text: "이메일이 중복됩니다.",
      });
    }
  } catch (e) {
    res.status(400).json({
      status: "fail",
      text: "ErrorCode:400, 잘못된 요청입니다.",
      error: e,
    });
  }
});

/*  
    user login 처리
    login 처리를 하게 되면 먼저 검증을 한다. 아이디 패스워드가 맞는지
    맞다면 userid를 페이로드에 담아 토큰을 전달한다.
    토큰을 받게 되면 그 userid로 필요한 정보를 받는다.
*/

router.post("/login", verifypassword, async (req, res) => {
  const email = req.body.email;
  const time = new Date(Math.floor(Date.now()));
  try {
    const [data] = await DB.promise().query(
      `select userid from users where email=?`,
      email
    );
    const user_id = data[0].userid;

    const token = jwt.sign(
      {
        _id: user_id,
        _email: email,
        _exp: new Date(time.setHours(time.getHours() + 12)),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "3h",
        issuer: "AjouSelves",
      }
    );
    res.status(200).json({
      status: "success",
      text: "토큰이 발급되었습니다.",
      exp: new Date(time),
      token: token,
    });
  } catch (e) {
    res
      .status(400)
      .json({ status: "fail", text: "로그인에 실패했습니다.", error: e });
  }
});

router.get("/token-test", verifyToken, (req, res) => {
  const userid = req.decoded._id;
  const email = req.decoded._email;
  const exp = req.decoded._exp;
  res.status(200).json({
    status: "success",
    text: "정상 작동하는 토큰입니다.",
    data: {
      _id: userid,
      _email: email,
      _exp: exp,
    },
  });
});

router.post("/pass-verify", verifyToken ,async(req,res) => {
  const email = req.decoded._email;
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
    if (req_pw == db_pw) res.status(200).json({ status: "succes", text: "비밀번호 검증에 성공했습니다." });
    else {
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

})

module.exports = router;

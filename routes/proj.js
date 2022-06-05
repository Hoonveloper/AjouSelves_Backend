const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../database/maria");
db.connect();
const multer = require("multer");
const { verifyToken } = require("./middleware/tokenmiddleware");
const DBconnection = require("../database/maria");
const { smtpTransport } = require("../config/email");


const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "photo/");
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    files: 10,
    fileSize: 1024 * 1024 * 5,
  },
});

const storage_qr = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "qr_pay/");
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + "-" + file.originalname);
  },
});

const upload_qr = multer({
  storage: storage_qr,
  limits: {
    files: 10,
    fileSize: 1024 * 1024 * 5,
  },
});

var searchprojbytitle = async function (req, res) {
  //SELECT * FROM proj WHERE title = req.asdf 이런식으로 제목으로 검색
  const title = req.body.title;
  console.log(title);

  try {
    const [data] = await db
      .promise()
      .query(
        `SELECT p.projID,p.title,p.state,p.category,p.min_num, p.created_at, u.NICKNAME FROM projs AS p JOIN users as u ON p.userid=u.userid where p.title LIKE '%${title}%';`
      );
    console.log(data);
    res.json(data);
  } catch {
    console.log("searchbytitle error 발생!");
    res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
  }
};

var getproj = async function (req, res) {
  //특정한 project 정보 가져오는 코드
  const id = req.params.id;
  const userid =req.decoded._id;
  let is_poster=0;
  let is_joined =0;
  try {
    const [proj] = await db
      .promise()
      .query(
        `SELECT p.title,p.state,p.category,p.min_num, p.cur_num,p.required, p.explained, p.created_at,p.amount,u.nickname, u.userid,u.profilelink FROM projs AS p INNER JOIN users AS u ON p.userid=u.userid WHERE p.projid=${id};`
      );
    const [join] = await db.promise().query(`select count(*) as cnt FROM participants WHERE projid=${id} AND userid=${userid}`);
    if(proj[0].cnt>0 ){
      //참여 한 경우
      is_joined=1;
    } 
    else{
      //참여하지 않은경우
      is_joined=0;


    }


    if( proj[0].userid==userid){
      //글 작성자인 경우
      is_poster=1;
    }
    else{
      //글 작성자가 아닌 경우
      is_poster=0;
    }
    const [photos] = await db
      .promise()
      .query(
        `SELECT * FROM photos WHERE projid=${id} ORDER BY thumbnail desc;`
      );
    console.log[photos];
    proj[0].photos = new Array();
    photos.forEach((photo) => {
      proj[0].photos.push(photo.url);
    });
    const [comments] = await db
      .promise()
      .query(`SELECT * FROM comments WHERE projid=${id}`);
    comments.forEach((e) => {
      var temp = new Object();
      temp.projid = e.projid;
      temp.userid = e.userid;
      temp.created_at = e.created_at;
      temp.comments = e.comments;
      temp.nickname = e.nickname;
      temp = JSON.stringify(temp);
      proj.push(JSON.parse(temp));
    });
    proj.push({is_poster:is_poster});
    proj.push({is_joined:is_joined});
    console.log(proj);
    res.send(proj);
  } catch {
    console.log("getproj에서 error 발생!");
    res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
  }
};

var getALLproj = async function (req, res) {
  //모든 project 정보 가져오는 코드
  try {
    const [data] = await db
      .promise()
      .query(
        `SELECT p.projid,p.title, p.state,p.category, p.created_at, u.userid, u.nickname,u.profilelink ,p.amount,p.min_num,p.cur_num,p.explained, ph.url FROM projs as p join users as u ON p.userid=u.userid LEFT JOIN photos as ph ON ph.projid=p.projid AND ph.thumbnail =1 ORDER BY created_at DESC`
      );
    console.log(data);
    res.json(data);
  } catch (e) {
    console.log(e);
    console.log("getALLpost에서 error 발생!");
    res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
  }
  //SELECT p.title, p.explained, p.created_at, u.userid, u.NICKNAME FROM post AS p join user AS u  ON p.userID=u.userid ;
};

var addproj_nophoto = async function (req, res) {
  //project 정보 db에 저장하는코드
  const userid=req.decoded._id;
  const {title,explained,min_num,category,amount} = req.body;
  var required=req.body.required;
  required = JSON.stringify(required).replace(/[\']/g, /[\"]/g);

  try {
    const data = await db
      .promise()
      .query(
        `INSERT INTO projs(userid,title,category,min_num,explained,required,amount) VALUES(${userid},'${title}','${category}',${min_num},'${explained}','${required}',${amount} )`
      );
    //console.log(data);
    res.json({ status: "success", text:"글 작성이 완료되었습니다." });
  } catch (e) {
    console.log(e);
    console.log("addpost에서 error 발생!");
    res.status(400).json({ status: "fail" });
  }
};

const addproj_multiphoto = async function (req, res) {
  //project 정보 db에 저장하는코드
  const photos = req.files;
  const userid = req.decoded._id;
  const {title,explained,min_num,category,amount} = req.body;
  var required=req.body.required;

  try {
    const [data] = await db
      .promise()
      .query(
        `INSERT INTO projs(userid,title,category,min_num,explained,required,amount) VALUES(${userid},'${title}','${category}',${min_num},'${explained}','${required}',${amount} )`
      );
    const insertid = data.insertId;
    console.log("파일 여러개 " + photos.length);

    photos.forEach(async (photo, idx) => {
      const photo_url = `/photo/${photo.filename}`;
      console.log(photo_url);
      const [photo_data] = await db
        .promise()
        .query(
          `INSERT INTO photos (postid,projid,url) VALUES(NULL,${insertid},'${photo_url}');`
        );
      if (idx == 0) {
        // 첫번째 사진을 Thumbnail 이미지로 변경.
        await db
          .promise()
          .query(`UPDATE photos SET thumbnail=1 WHERE url='${photo_url}';`);
      }
    });

    res.json({ status: "success" ,text:"사진이 첨부된 proj등록 성공"});
  } catch (e) {
    console.log("addpost_multi에서 error 발생!");
    console.log(e);
    res.status(400).json({ status: "fail" });
  }
};

var editproj_nophoto = async function (req, res) {
  const userid = req.decoded._id;
  const projid= req.params.id;
  const {title,explained,min_num,category,amount} = req.body;
  var required=req.body.required;
  required = JSON.stringify(req.body.required);
  try {
    const [checkID] = await db
      .promise()
      .query(`select userid from projs where projid=${projid};`);
    console.log(checkID[0].userid);
    if (checkID[0].userid != userid) {
      res.json({ status: "fail", text: "글 작성자만 수정이 가능합니다." });
    } else {
      const data = await db
        .promise()
        .query(
          `UPDATE projs SET amount=${amount},title='${title}', explained='${explained}',min_num=${min_num},category='${category}',required='${required}'  WHERE projid=${projid};`
        );
      res.json({ text: "success",text:"글 수정이 완료되었습니다." });
    }
  } catch (e) {
    console.log(e);
    console.log("editpost에서 error 발생!");
    res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다.", e });
  }
};

var editproj_multiphoto = async function (req, res) {
  const userid=req.decoded._id;
  const photos = req.files;
  const projid = req.params.id;
  const {title,explained,min_num,category,amount} = req.body;
  var required=req.body.required;
  required = JSON.stringify(req.body.required);

 
  

  
  try {
    const [checkID] = await db
      .promise()
      .query(`select userid from projs where projid=${projid};`);
    console.log(checkID);
    if (checkID[0].userid != userid) {
      res.json({ status: "fail", text: "글 작성자만 수정이 가능합니다." });
    } else {
      await db.promise().query(`DELETE from photos where projid=${projid};`); //본래 있던 사진 삭제.
      photos.forEach(async (photo, idx) => {
        const photo_url = `/photo/${photo.filename}`;
        console.log(photo_url);
        await db
          .promise()
          .query(
            `INSERT INTO photos (postid,projid,url) VALUES(NULL,${projid},'${photo_url}');`
          );
        if (idx == 0) {
          // 첫번째 사진을 Thumbnail 이미지로 변경.
          await db
            .promise()
            .query(`UPDATE photos SET thumbnail=1 WHERE url='${photo_url}';`);
        }
      });
      const data = await db
        .promise()
        .query(
          `UPDATE projs SET amount=${amount},title='${title}', explained='${explained}',min_num='${min_num}',category='${category}',required='${required}'  WHERE projid=${projid};`
        );
      res.json({ status: "success" ,text:"글 수정이 완료되었습니다."});
    }
  } catch (e) {
    console.log(e);
    console.log("editpost에서 error 발생!");
    res.status(400).json({ status: "fail" });
  }
};
const edit_state = async function (req, res) {
  /*판매자가 status 변경 하는 경우
  status 1. 모집중
  status 2. 결제중
  status 3. 작업중
  status 4. 프로젝트 끝
  ----구현 해야 할 내용-----
  1. 판매자인지 확인
  2. status 올릴건지, 내릴건지 구분
  3. status 2->1 내릴 때 이미 결제를 한 사람이 있다면 불가. (우선순위 낮아서 아직 미구현.)
  */
  const userid = req.decoded._id;
  const projid = req.params.id;
  const state = req.body.state;

  try {
    const [isCreater] = await db
      .promise()
      .query(
        `select state from projs where projid=${projid} AND userid=${userid};`
      );
    console.log(isCreater);
    if (isCreater.length == 0) {
      //판매자가 아닌 경우
      res.json({ status: "fail", text: "판매자가 아닙니다. " });
    } else if (
      isCreater[0].state == state ||
      Math.abs(isCreater[0].state - state) >= 2
    ) {
      // 같은 status로 변경 or status 2단계 이상 수정하려는 경우
      res.json({
        status: "fail",
        text: "프로젝트 상태 수정에 오류가 있습니다.",
      });
    } else {
      // state 수정 코드
      await db
        .promise()
        .query(`UPDATE projs SET state='${state}' WHERE projid=${projid}; `);
      res.json({
        status: "success",
        text: "프로젝트 상태 수정이 완료되었습니다.",
      });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
  }
};
var delproj = async function (req, res) {
  //project 정보 삭제
  //사진까지 삭제
  const userid = req.decoded._id;
  const projid = req.params.id;
  try {
    const [checkID] = await db
      .promise()
      .query(`select userid from projs where projid=${projid};`);
    console.log(checkID);
    if (checkID[0].userid != userid) {
      res.json({ status: "fail", text: "글 작성자만 삭제가 가능합니다." });
    } else {
      const data = await db
        .promise()
        .query(`DELETE FROM projs WHERE projid=${projid};`);
      console.log(data);
      await db.promise().query(`DELETE FROM photos WHERE projid=${projid};`);
      res.json({ text: "success" });
    }
  } catch {
    console.log("delpost에서 error 발생!");
    res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
  }
};

const join = async function (req, res) {
  /*
    참여하는 코드
    1.현재인원수 +1;
    2.참가자 명단 업데이트

    
    */

  const userid = req.decoded._id;
  const projid = req.params.id;
  try {
    const [data] = await db
      .promise()
      .query(
        `select * from participants WHERE userid=${userid} AND projid=${projid}`
      );
    console.log(data.length);
    if (data.length != 0) {
      //이미 참여 한 경우 +1안함.
      res
        .status(400)
        .json({ status: "fail", text: "이미 굿즈를 구매하였습니다." });
    } else {
      //새로 참여하는 경우.
      var result = await db
        .promise()
        .query(`select cur_num from projs WHERE projid=${projid}`);
      const cur_num = result[0][0].cur_num;
      await db
        .promise()
        .query(
          `UPDATE projs set cur_num=${cur_num + 1} WHERE projid=${projid};`
        ); //인원수 +1
      await db
        .promise()
        .query(
          `INSERT INTO participants(projid,userid) VALUES(${projid},${userid})`
        ); // 참가자 명단 업데이트
      res.json({ status: "success" });
    }
  } catch (e) {
    console.log(e);
    console.log("join error 발생!");
    res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
  }
};

const leave = async function (req, res) {
  /*
    참여 취소하는 코드
    1.현재인원수 +1;
    2.참가자 명단 업데이트
  */

  const userid = req.decoded._id;
  const projid = req.params.id;

  try {
    const [data] = await db
      .promise()
      .query(
        `select * from participants WHERE userid=${userid} AND projid=${projid}`
      );
    if (data.length == 0) {
      res.status(400).json({ status: "fail", text: "you are not here" });
    } else {
      var result = await db
        .promise()
        .query(`select cur_num from projs WHERE projid=${projid}`);
      const cur_num = result[0][0].cur_num;
      await db
        .promise()
        .query(
          `UPDATE projs set cur_num=${cur_num - 1} WHERE projid=${projid};`
        ); //인원수 -1
      await db
        .promise()
        .query(
          `DELETE FROM participants WHERE projid=${projid} AND userid=${userid}`
        ); // 참가자 명단 업데이트
      res.json({ status: "success" });
    }
  } catch (e) {
    console.log(e);
    console.log("join error 발생!");
    res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
  }
};

// 결제 코드를  보기위해서는 해당 유저가 프로젝트에 참여해야하며 그 프로젝트의 결제 링크를 보내야한다.

const pay_qr = async function (req, res) {
  const userid = req.decoded._id;
  const projid = req.params.id;
  try {
    const [data] = await db
      .promise()
      .query(
        `select paylink ,qr_url from projs JOIN participants as p ON p.projid=projs.projid WHERE p.userid=${userid} AND p.projid=${projid} ;`
      );
    console.log(data[0].paylink);
    if (data[0].paylink == null || data[0].qr_url ==null) {
      res.json({
        status: "fail",
        text: "판매자가 QR 결제 링크 혹은 QR코드 사진을 등록하지 않았습니다.",
      });
    } else {
      res.json({ status: "success", paylink: data[0].paylink , qr_url:data[0].qr_url });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
  }
};

const add_qr = async function (req, res) {
  const photo = req.files;
  const userid = req.decoded._id;
  const projid = req.params.id;
  const photo_url = `qr_pay/${photo[0].filename}`;
  

  try {
    //먼저 판매자가 맞는지 확인.
    const [isCreater] = await db
      .promise()
      .query(
        `select paylink from projs WHERE projid=${projid} AND userid=${userid} `
      );
    console.log(isCreater);
    // paylink 컬럼이 비었는지 확인
    if (isCreater.length == 0) {
      //판매자가 아닌 경우
      res.json({ status: "fail", text: "판매자가 아닙니다. " });
    } else if (isCreater[0].paylink) {
      // 이미 qr 결제 링크가 있는 경우
      res.json({ status: "fail", text: "이미 QR 결제 링크를 등록하였습니다." });
    } else {
      // qr결제 링크가 빈 경우
      await db
        .promise()
        .query(
          `UPDATE projs SET paylink='${req.body.paylink}' ,qr_url='${photo_url}' WHERE projid=${projid}; `
        );
      
      res.json({ status: "success", text: "QR 결제 링크가 추가되었습니다." });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
  }
};

const edit_pay_qr = async function (req, res) {
  const photo=req.files;
  const userid = req.decoded._id;
  const projid = req.params.id;
  const photo_url = `qr_pay/${photo[0].filename}`;
  try {
    const [isCreater] = await db
      .promise()
      .query(
        `select paylink from projs WHERE projid=${projid} AND userid=${userid} `
      );
    console.log(isCreater);
    if (isCreater.length == 0) {
      //판매자가 아닌 경우
      res.json({ status: "fail", text: "판매자가 아닙니다. " });
    } else if (!isCreater[0].paylink) {
      // 등록된 QR 링크가 없을 경우
      res.json({ status: "fail", text: "등록된 QR 결제 링크가 없습니다." });
    } else {
      // qr결제 링크가 있을 때 수정 코드
      await db
        .promise()
        .query(
          `UPDATE projs SET paylink='${req.body.paylink}',qr_url='${photo_url}' WHERE projid=${projid}; `
        );
      res.json({ status: "success", text: "QR 결제 링크가 수정되었습니다." });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
  }
};

const import_api = async function(req,res){
  const userid= req.decoded._id;
  const useremail=req.decoded._email;
  try{

    const { imp_uid, merchant_uid ,projid} = req.body;
    const getToken = await axios({
      url: "https://api.iamport.kr/users/getToken",
      method: "post", // POST method
      headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
      data: {
        imp_key: process.env.IMPORT_API_KEY, // REST API 키
        imp_secret: process.env.IMPORT_SECRET_KEY// REST API Secret
      }
    });
    console.log(getToken);
    const { access_token } = getToken.data.response;// 조회한 결제 정보
    const getPaymentData = await axios({
      url: `https://api.iamport.kr/payments/${imp_uid}`, 
      method: "get", 
      headers: { "Authorization": access_token } 
    });
    const paymentData = getPaymentData.data.response; // 조회한 결제 정보
    console.log(paymentsData);
     // DB에서 결제되어야 하는 금액 조회
     const [order] = await db.promise().query(`select amount from projs where projid=${projid} `);
     const amountToBePaid = order[0].amount; // 결제 되어야 하는 금액
     // 결제 검증하기
     const { amount, status } = paymentData;
     if (amount === amountToBePaid) { // 결제금액 일치. 결제 된 금액 === 결제 되어야 하는 금액
       await db.promise().query(`INSERT INTO payments(merchant_uid,projid,userid,amount) VALUES(${merchant_uid, projid, userid, amount})`);
       
       switch (status) {
         case "ready": // 가상계좌 발급
           // DB에 가상계좌 발급 정보 저장
           const { vbank_num, vbank_date, vbank_name } = paymentData;
           await Users.findByIdAndUpdate("/* 고객 id */", { $set: { vbank_num, vbank_date, vbank_name }});
           await db.promise().query(`UPDATE payments SET vbank_num=${vbank_num}, vbank_name=${vbank_name}, vbank_date=${vbank_date} WHERE projid=${projid} AND userid=${userid}`);
           // 가상계좌 발급 안내 문자메시지 발송
           const mailoptions = {
            from: "ajouselves@naver.com",
            to: useremail,
            subject: "[Goods By us] 가상계좌 발급 관련 메일입니다. ",
            text: `가상계좌 발급이 성공되었습니다. 계좌 정보 ${vbank_num} ${vbank_date} ${vbank_name}`
          };
          await smtpTransport.sendMail(
            mailoptions,
            (error, response) => {
              if (error) {
                console.log(error);
              } 
              smtpTransport.close();
            }
          );
          res.send({ status: "vbankIssued", message: "가상계좌 발급 성공" });
          break;
         case "paid": // 결제 완료
           await db.promise().query(`UPDATE payments SET paid =1 WHERE projid=${projid} AND userid=${userid}`);
           res.send({ status: "success", message: "일반 결제 성공" });
           break;
       }
     } else { // 결제금액 불일치. 위/변조 된 결제
       throw { status: "forgery", message: "위조된 결제시도" };
     }
  }catch(e){



  }
}

const add_pay_photo = async function(req,res){
  const qr_photo = req.files;
  const userid = req.decoded._id;
  const projid = req.params.id;
  try {
    //먼저 판매자가 맞는지 확인.
    const [isCreater] = await db
      .promise()
      .query(
        `select paylink from projs WHERE projid=${projid} AND userid=${userid} `
      );
    console.log(isCreater);
    // paylink 컬럼이 비었는지 확인
    if (isCreater.length == 0) {
      //판매자가 아닌 경우
      res.json({ status: "fail", text: "판매자가 아닙니다. " });
    } else if (isCreater[0].paylink) {
      // 이미 qr 결제 링크가 있는 경우
      res.json({ status: "fail", text: "이미 QR 결제 링크를 등록하였습니다." });
    } else {
      // qr결제 링크가 빈 경우
      await db
        .promise()
        .query(
          `UPDATE projs SET paylink='${req.body.paylink}' WHERE projid=${projid}; `
        );
      res.json({ status: "success", text: "QR 결제 링크가 추가되었습니다." });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
  }


}

router.post("/searchbytitle", searchprojbytitle);
router.get("/", getALLproj);
router.get("/:id", verifyToken,getproj);
router.put("/:id",verifyToken, editproj_nophoto);
router.put("/photo/:id",verifyToken, upload.array("photo"), editproj_multiphoto);
router.put("/state/:id",verifyToken,edit_state );
router.delete("/:id",verifyToken, delproj);
router.post("/",verifyToken, addproj_nophoto);
router.post("/photo",verifyToken, upload.array("photo"), addproj_multiphoto);
router.get("/join/:id", verifyToken,join);
router.get("/leave/:id", verifyToken,leave);
router.get("/pay/qr/:id",verifyToken,pay_qr);
router.post("/pay/qr/:id",verifyToken,upload_qr.array("photo"),add_qr);
router.put("/pay/qr/:id",verifyToken,upload_qr.array("photo"),edit_pay_qr);



/*
* 아임포트 연동 api 구현 완료. 그러나 FE/APP 미구현 사항으로 인한 주석처리
router.post("pay/import",verifyToken,import_api);

*/


module.exports = router;

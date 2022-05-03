const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../database/maria");
db.connect();
const multer = require("multer");
const { verifyToken } = require("./authmiddleware");

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

  try {
    const [proj] = await db
      .promise()
      .query(
        `SELECT p.title,p.state,p.category,p.min_num, p.cur_num,p.required, p.explained, p.created_at,u.nickname, u.userid,u.profilelink FROM projs AS p INNER JOIN users AS u ON p.userid=u.userid WHERE p.projid=${id};`
      );
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
        `SELECT p.projid,p.title, p.state,p.category, p.created_at, u.userid, u.nickname,u.profilelink ,p.min_num,p.cur_num, ph.url FROM projs as p join users as u ON p.userid=u.userid LEFT JOIN photos as ph ON ph.projid=p.projid ORDER BY created_at DESC`
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
  const userid = req.body.userid;
  const title = req.body.title;
  const explained = req.body.explained;
  const min_num = req.body.min_num;
  const category = req.body.category;
  var required = {};
  required = req.body.required;

  required = JSON.stringify(required).replace(/[\']/g, /[\"]/g);

  try {
    const data = await db
      .promise()
      .query(
        `INSERT INTO projs(userid,title,category,min_num,explained,required) VALUES(${userid},'${title}','${category}',${min_num},'${explained}','${required}' )`
      );
    //console.log(data);
    res.json({ status: "success" });
  } catch (e) {
    console.log(e);
    console.log("addpost에서 error 발생!");
    res.status(400).json({ status: "fail" });
  }
};
const addproj_onephoto = async function (req, res) {
  const photos = req.file;
  const userid = req.body.userid;
  const title = req.body.title;
  const explained = req.body.explained;
  const min_num = req.body.min_num;
  const category = req.body.category;
  var required = {};
  required = req.body.required;

  try {
    const [data] = await db
      .promise()
      .query(
        `INSERT INTO projs(userid,title,category,min_num,explained,required) VALUES(${userid},'${title}','${category}',${min_num},'${explained}','${required}' )`
      );
    const insertid = data.insertId;
    console.log("파일 한 개 ");
    const photo_url = `/photo/${photos.filename}`;
    const [photo_data] = await db
      .promise()
      .query(
        `INSERT INTO photos (projid,postid,url) VALUES(${insertid},NULL,'${photo_url}');`
      );
    res.json({ status: "success" });
  } catch (e) {
    console.log(e);
    console.log("addpost_onephoto에서 error 발생!");
    res.status(400).json({ status: "fail" });
  }
};

const addproj_multiphoto = async function (req, res) {
  //project 정보 db에 저장하는코드

  const photos = req.files;
  const userid = req.body.userid;
  const title = req.body.title;
  const explained = req.body.explained;
  const min_num = req.body.min_num;
  const category = req.body.category;
  var required = {};
  required = req.body.required;

  console.log(req.files);
  try {
    const [data] = await db
      .promise()
      .query(
        `INSERT INTO projs(userid,title,category,min_num,explained,required) VALUES(${userid},'${title}','${category}',${min_num},'${explained}','${required}' )`
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

    res.json({ status: "success" });
  } catch (e) {
    console.log("addpost_multi에서 error 발생!");
    console.log(e);
    res.status(400).json({ status: "fail" });
  }
};

var editproj_nophoto = async function (req, res) {
  const projid = req.params.id;

  const title = req.body.title;
  const explained = req.body.explained;
  const min_num = req.body.min_num;
  const category = req.body.category;

  var required = {};
  required = req.body.required;
  console.log(req.body.required);

  try {
    const data = await db
      .promise()
      .query(
        `UPDATE projs SET title='${title}', explained='${explained}',min_num=${min_num},category='${category}',required='${req.body.required}'  WHERE projid=${projid};`
      );
    res.json({ text: "success" });
  } catch (e) {
    console.log(e);
    console.log("editpost에서 error 발생!");
    res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
  }
};

var editproj_onephoto = async function (req, res) {
  //추가해야할 것 : userid 가져와서 req에서 받은  userid값과 비교.
  const photos = req.file;
  const projid = req.params.id;

  const title = req.body.title;
  const explained = req.body.explained;
  const min_num = req.body.min_num;
  const category = req.body.category;
  var required = {};
  required = req.body.required;

  const photo_url = `/photo/${photos.filename}`;
  try {
    await db.promise().query(`DELETE from photos where projid=${projid};`); //본래 있던 사진 삭제.
    await db
      .promise()
      .query(
        `INSERT INTO photos(postid,projid,url,thumbnail) VALUES(NULL,${projid},'${photo_url}',1)`
      );
    const [data] = await db
      .promise()
      .query(
        `UPDATE projs SET title='${title}', explained='${explained}',min_num='${min_num}',category='${category}',required='${required}'  WHERE projid=${projid};`
      );
    res.json({ status: "success" });
  } catch (e) {
    console.log(e);
    console.log("editpost에서 error 발생!");
    res.status(400).json({ status: "fail" });
  }
};
var editproj_multiphoto = async function (req, res) {
  const photos = req.files;
  const projid = req.params.id;

  const title = req.body.title;
  const explained = req.body.explained;
  const min_num = req.body.min_num;
  const category = req.body.category;
  var required = {};
  required = req.body.required;

  const photo_url = `/photo/${photos.filename}`;
  try {
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
        `UPDATE projs SET title='${title}', explained='${explained}',min_num='${min_num}',category='${category}',required='${required}'  WHERE projid=${projid};`
      );
    res.json({ status: "success" });
  } catch (e) {
    console.log(e);
    console.log("editpost에서 error 발생!");
    res.status(400).json({ status: "fail" });
  }
};

var delproj = async function (req, res) {
  //project 정보 삭제
  //사진까지 삭제

  const projid = req.params.id;
  try {
    const data = await db
      .promise()
      .query(`DELETE FROM projs WHERE projid=${projid};`);
    console.log(data);
    await db.promise().query(`DELETE FROM photos WHERE projid=${projid};`);
    res.json({ text: "success" });
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

  const userid = req.body.userid;
  const projid = req.body.projid;
  //var cur_num= req.body.cur_num;
  try {
    var result = await db
      .promise()
      .query(`select cur_num from projs WHERE projid=${projid}`);
    const cur_num = result[0][0].cur_num;
    //cur_num.forEach((e)=> console.log(e));
    const [data] = await db
      .promise()
      .query(
        `select * from participants WHERE userid=${userid} AND projid=${projid}`
      );
    console.log(data);
    if (data) {
      res.status(400).json({ text: "already joined" });
    } else {
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
      res.json({ text: "success" });
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

  const userid = req.body.userid;
  const projid = req.body.projid;
  var cur_num = req.body.cur_num;
  try {
    const [data] = await db
      .promise()
      .query(
        `select * from participants WHERE userid=${userid} AND projid=${projid}`
      );
    if (!data) {
      res.status(400).json({ text: "you are not here" });
    }
    await db
      .promise()
      .query(`UPDATE projs set cur_num=${cur_num - 1} WHERE projid=${projid};`); //인원수 +1
    await db
      .promise()
      .query(
        `DELETE FROM participants WHERE projid=${projid} AND userid=${userid}`
      ); // 참가자 명단 업데이트
    res.json({ text: "success" });
  } catch (e) {
    console.log(e);
    console.log("join error 발생!");
    res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
  }
};

// 결제 코드를  보기위해서는 해당 유저가 프로젝트에 참여해야하며 그 프로젝트의 결제 링크를 보내야한다.
router.get("/payment", verifyToken, async (req, res) => {
  const user_id = req.decoded._id;
  const select_projid = req.body.projid;
  const attend_proj = await db
    .promise()
    .query(`select projid from participants where userid = ?`, user_id);

  const check_proj = attend_proj.filter((v) => v == select_projid);
  const result_proj = parseInt(check_proj);
  if (isNaN(result_proj) == true) {
    console.log("no match project");
    res.status(400).json({ text: "ErrorCode:400, 잘못된 요청입니다." });
  } else {
    const pay_link = await db
      .promise()
      .query(`select paylink from projs where projid = ?`, result_proj);
    console.log("match success project");
    res.json(pay_link);
  }
});

router.post("/searchbytitle", searchprojbytitle);
router.get("/", getALLproj);
router.get("/:id", getproj);
router.put("/edit/:id", editproj_nophoto);
router.put("/edit/single/:id", upload.single("photo"), editproj_onephoto);
router.put("/edit/multi/:id", upload.array("photo"), editproj_multiphoto);
router.delete("/delete/:id", delproj);
router.post("/add", addproj_nophoto);
router.post("/add/single", upload.single("photo"), addproj_onephoto);
router.post("/add/multi", upload.array("photo"), addproj_multiphoto);
router.post("/join", join);
router.post("/leave", leave);

module.exports = router;

#

# AjouSelves_Backend

## API 명세서

[굿즈 프로젝트 API 명세서.pdf](https://mature-girdle-388.notion.site/API-0dc639a485dc424ca8db2b4e807761f3)

[커뮤니티 게시글 API 명세서.pdf](https://mature-girdle-388.notion.site/41c6e62d7bfa46c5a3eeba0412bb5b7f)

[댓글\_API 명세서.pdf](https://mature-girdle-388.notion.site/API-76c8d2718f654d808594535277bbd3c5)

[Auth API 명세서.pdf](https://drive.google.com/file/d/1KzAkBEHVnGETTgUauLKe_tfPUtzPf4A5/view?usp=sharing)

[User API 명세서.pdf](https://drive.google.com/file/d/1wAZX-9HrePY-2qGC8ohEaoegE5aiPoQm/view?usp=sharing)


## ER DIAGRAM

![GBU_DB](https://user-images.githubusercontent.com/77804950/171029169-d166ea0a-5976-4fc9-8ba3-b3f6af0fd6d2.png)

## initial setting

### Create a config folder

```
  > config.js

  module.exports = {
    server_port : 3000,
    db_url : 'mariadb://127.0.0.1:3306/local',
    db_host : '127.0.0.1', (or localhost)
    db_pw : input your password,
    db_user : input your user,
    db_port : 3306,
    db_name : input your DB_NAME
  }

  > email.js 및 .env파일은 백엔드 팀에게 문의 바람

```

---

## usage

```
> url = http://goodsbyus.com
> API 사용 = http://goodsbyus.com/api/~

cd AjouSelves_Backend
yarn install
yarn start or pm2 start app.js

API 사용은 위의 API 명세서를 확인 부탁드립니다.

```

---

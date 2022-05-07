#

# AjouSelves_Backend

## API 명세서

[굿즈 프로젝트 API 명세서.pdf](https://mature-girdle-388.notion.site/API-0dc639a485dc424ca8db2b4e807761f3)

[커뮤니티 게시글 API 명세서.pdf](https://mature-girdle-388.notion.site/41c6e62d7bfa46c5a3eeba0412bb5b7f)

[댓글\_API 명세서.pdf](https://mature-girdle-388.notion.site/API-76c8d2718f654d808594535277bbd3c5)

[Auth API 명세서.pdf](https://drive.google.com/file/d/12BQ2qivHRDQc_1_M-IXMFd6jlCKrzHs_/view?usp=sharing)

[User API 명세서.pdf](https://drive.google.com/file/d/15Md3mkO29dWH4nefDCo90sjfeXDNEBTW/view?usp=sharing)

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
> url은 domain 구입 후 제공 예정.
> 현재 결과 확인은 AjouSelves 구성원만 가능합니다.

cd AjouSelves_Backend
yarn start

API 사용은 위의 API 명세서를 확인 부탁드립니다.

```

---

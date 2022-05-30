[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2FHoonveloper%2FAjouSelves_Backend&count_bg=%234A4B49&title_bg=%23000000&icon=&icon_color=%23DDCDCD&title=hits&edge_flat=false)](https://hits.seeyoufarm.com)

굿즈바이어스 사이트는 [여기](goodsbyus.com)를 클릭해주세요

# Goods By Us 
[22-1] 파란학기제

팀 Ajouselves



## 서비스 소개
굿즈바이어스는, 아주대 학생들의 소속감, 유대감 증진을 위한 **아주대학교 굿즈 제작 클라우드 펀딩 플랫폼**입니다.

보다 쉬운 접근성을 위해 안드로이드 및 iOS 환경에 맞는 어플과 웹사이트를 개발하였습니다.

[Goods By Us : 굿즈바이어스]: goodsbyus.com


## 굿즈바이어스 로고

<img src="https://user-images.githubusercontent.com/77804950/171029835-36e5a22c-6f85-4acd-bd47-4d1bfa6a5686.jpg"  width="50%" height="50%"/>

<img src="https://user-images.githubusercontent.com/77804950/171029843-acae241a-c649-45e7-a3d7-743e0297f6e1.jpg"  width="50%" height="50%"/>

<img src="https://user-images.githubusercontent.com/77804950/171029844-8a745cb8-ba33-40c9-9bd1-9dc9f6d3f9b9.jpg"  width="50%" height="50%"/>

<img src="https://user-images.githubusercontent.com/77804950/171029849-194d2303-50da-42de-86bb-dbc034449230.jpg"  width="50%" height="50%"/>




## API 명세서

[굿즈 프로젝트 API 명세서.pdf](https://mature-girdle-388.notion.site/API-0dc639a485dc424ca8db2b4e807761f3)

[커뮤니티 게시글 API 명세서.pdf](https://mature-girdle-388.notion.site/41c6e62d7bfa46c5a3eeba0412bb5b7f)

[댓글\_API 명세서.pdf](https://mature-girdle-388.notion.site/API-76c8d2718f654d808594535277bbd3c5)

[Auth API 명세서.pdf](https://drive.google.com/file/d/1KzAkBEHVnGETTgUauLKe_tfPUtzPf4A5/view?usp=sharing)

[User API 명세서.pdf](https://drive.google.com/file/d/1wAZX-9HrePY-2qGC8ohEaoegE5aiPoQm/view?usp=sharing)


## ER DIAGRAM


<img src="https://user-images.githubusercontent.com/77804950/171029169-d166ea0a-5976-4fc9-8ba3-b3f6af0fd6d2.png"  width="80%" height="80%"/>


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


## 백엔드 기술 스택

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white)
![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white)

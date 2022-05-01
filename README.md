# 

# AjouSelves_Backend

## API 명세서


[굿즈 프로젝트 API 명세서.pdf](https://drive.google.com/file/d/1DJyNPbUen_H8WehWUvjg0ChyNh03LHJW/view?usp=sharing)

[커뮤니티 게시글 API 명세서.pdf](https://drive.google.com/file/d/1-sO9aD8kMA-eY5Yekj3EPju4YxCT9cHc/view?usp=sharing)

[댓글_API 명세서.pdf](https://drive.google.com/file/d/1yqcUUEhEiQjXxWQK6CYZ8Nm8hnuTASNL/view?usp=sharing)

[User & Auth API 명세서.pdf](https://drive.google.com/file/d/1zNP6Vy5Sev_XSWi8pT7yAAIA7OwsdTdl/view?usp=sharing)


## initial setting


### Create a config folder
```
  > config.js
  
  module.exports = {
  server_port: 3000,
  db_url: 'mariadb://127.0.0.1:3306/local',
  db_host:'127.0.0.1',
  db_pw: input your password,
  db_user:input your user,
  db_port:3306,
  db_name: input your DB_NAME
  }
  
  > email.js 및 .env파일은 백엔드 팀에게 문의바람
 
```

---

## usage
```
> url은 domain 구입 후 제공 예정. 
> 현재 결과 확인은 구성원만 가능

cd AjouSelves_Backend
yarn start

```

---

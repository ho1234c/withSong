# withSong

Demo : [http://withsong.herokuapp.com/](http://withsong.herokuapp.com/)

I like to listen to music while on the Internet.<br>
In order to play music, you click mouse left button and if you want save the music, click mouse right button. (mobile: hold touch).

인터넷 서핑을 하면서 노래를 듣고싶어서 제작.<br>
마우스 왼쪽버튼으로 음악재생, 마우스 오른쪽 버튼(모바일: 터치길게)으로 음악을 내 목록에 넣을 수 있다.


Distribute
----------
나만 이용하면 되기 때문에 느리지만 무료인 heroku의 free dynos type을 통해 배포.

Database
--------
heroku에서 무료로 제공하는 postgreSQL을 사용. 10000줄까지 무료.

Environment
-----------
### server
"start" 부분의 코드는 heroku를 통한 배포에 필요.
```javascript
// package.json
{
  "name": "withsong",
  "version": "1.0.0",
  "description": "",
  "main": "app.js",
  "dependencies": {
    "body-parser": "^1.15.1",
    "express": "^4.13.4",
    "mobile-detect": "^1.3.2",
    "pg": "^5.1.0",
    "sequelize": "^3.23.3",
    "underscore": "^1.8.3"
  },
  "devDependencies": {},
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node app.js"
  }
}
 }

```

<br>

### client
```javascript
// bower.json
{
  "name": "withSong",
  "description": "",
  "main": "index.html",
  "authors": [
    "jongho <ho1234c@gmail.com>"
  ],
  "license": "ISC",
  "homepage": "",
  "ignore": [
    "**/.*",
    "node_modules",
    "bower_components",
    "test",
    "tests"
  ],
  "dependencies": {
    "angular-cookies": "^1.5.7",
    "angular-touch": "^1.5.7",
    "angular": "angularjs#^1.5.7",
    "ng-dialog": "ngDialog#^0.6.2"
  }
}

```


Open Api
--------
SK planet developers 멜론 실시간 차트<br>
[https://developers.skplanetx.com/](https://developers.skplanetx.com/)

youtube data api<br>
[https://developers.google.com/youtube/?hl=ko](https://developers.google.com/youtube/?hl=ko)<br>
[https://www.youtube.com/yt/dev/](https://www.youtube.com/yt/dev/)
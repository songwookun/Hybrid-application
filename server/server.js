const express = require('express');
const cors = require('cors');
const app = express();
const port = 8040;


app.use(cors());

app.get('/hi', (req, res) => {
    res.send('6주차 과제 내용 아무거나 글쓰는중 에베ㅔ베베베베베베베베베베베베베베베베베 오헤헤헿헤ㅔ');
});

app.listen(port, () => {
    console.log(`서버가 http://localhost:${port}/hi 에서 실행 중입니다.`);
});


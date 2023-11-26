const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const port = 8022;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Sequelize 설정
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite' // SQLite 데이터베이스 파일명
});

// 사용자 모델 정의
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});
const Diary = sequelize.define('Diary', {
    username:{
        type:DataTypes.STRING,
        allowNull:false
    },
    date: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    textColor: {
        type: DataTypes.STRING,
        allowNull: true
    },
    backgroundColor: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

async function initializeDatabase() {
    try {
        await User.sync({ force: false }); // force 옵션 변경
        await Diary.sync({ force: false }); // force 옵션 변경
        console.log("User와 Diary 테이블이 성공적으로 생성되었습니다.");
    } catch (error) {
        console.error("테이블 생성 중 오류가 발생하였습니다:", error);
    }
}

initializeDatabase();

// 로그인 엔드포인트 추가
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: '사용자 이름과 비밀번호가 필요합니다.' });
    }

    try {
        const user = await User.findOne({ where: { username, password } });
        if (user) {
        return res.status(200).json({ message: '로그인 성공!' });
        } else {
        return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '로그인 중 오류가 발생하였습니다.' });
    }
});

// 회원가입 엔드포인트 수정
app.post('/storeCredentials', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: '사용자 이름과 비밀번호가 필요합니다.' });
    }

    try {
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ error: '이미 존재하는 계정입니다.', existingUser: true });
        }
        const user = await User.create({ username, password });
        res.status(200).json({ message: '성공적으로 저장되었습니다.', user, existingUser: false });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '회원가입에 실패하였습니다.' });
    }
});

// 일기 저장 엔드포인트 추가
app.post('/saveDiary', async (req, res) => {
    const { username, date, content, textColor, backgroundColor } = req.body;

    if (!username || !date || !content) {
        return res.status(400).json({ error: '사용자 이름, 날짜, 내용이 필요합니다.' });
    }

    try {
        const diary = await Diary.create({ username, date, content, textColor, backgroundColor });
        res.status(200).json({ message: '일기가 성공적으로 저장되었습니다.', diary });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '일기 저장 중 오류가 발생하였습니다.' });
    }
});

// 일기 불러오기 엔드포인트 추가
app.get('/getDiary', async (req, res) => {
    const { username, date } = req.query;

    if (!username || !date) {
        return res.status(400).json({ error: '사용자 이름과 날짜가 필요합니다.' });
    }

    try {
        const diaries = await Diary.findAll({ where: { username, date } });
        if (diaries.length > 0) {
            res.status(200).json({ content: diaries });
        } else {
            res.status(404).json({ message: '해당 날짜에 저장된 일기가 없습니다.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '일기 불러오기 중 오류가 발생하였습니다.' });
    }
});

app.post('/deleteContent', async (req, res) => {
  const { username, date, contentToDelete } = req.body;

  if (!username || !date || !contentToDelete || !Array.isArray(contentToDelete)) {
      return res.status(400).json({ error: '사용자 이름, 날짜, 삭제할 내용이 필요합니다.' });
  }

  try {
      const deletedDiaries = await Promise.all(
          contentToDelete.map(async (index) => {
              const diaries = await Diary.findAll({ where: { username, date } });
              if (diaries.length > index) {
                  await Diary.destroy({ where: { id: diaries[index].id } });
                  return diaries[index];
              }
          })
      );

      res.status(200).json({ message: '선택한 내용이 성공적으로 삭제되었습니다.', deletedDiaries });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: '일기 삭제 중 오류가 발생하였습니다.' });
  }
});

app.listen(port, () => {
    console.log(`서버가 ${port} 포트에서 실행 중입니다.`);
});
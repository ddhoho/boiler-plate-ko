const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const { User } = require("./models/User");

const config = require("./config/key");

//application/x-www-form-urlencoded 이렇게 된 데이트럴 분석하게 해줌
app.use(bodyParser.urlencoded({ extended: true }));

//application/json 이걸 분석 
app.use(bodyParser.json());


const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
     useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected...'))
     .catch(err => console.log(err))

app.get('/', (req, res) => {
     res.send('Hello World! 230930!!!!!!!!!!')
})

//app.post('/register', (req, res) => {
app.post('/register', async (req, res) => {

     // 회원 가입 할때 필요한 정보들을 client에서 가져오면
     // 그것들을 데이터 베이스에 넣어준다.

     const user = new User(req.body);

     // 몽고db에 저장?
     // user.save((err, userInfo) => {
     //      if (err) return res.json({ success: false, err })
     //      return res.status(200).json({
     //           success: true
     //      })
     // })
     // 현재 콜백을 인자로 받지 않게 됨

     await user
          .save()
          .then(() => {
               res.status(200).json({
                    success: true
               });
          })
          .catch((err) => {
               console.error(err);
               res.json({
                    success: false,
                    err: err
               });
          });
});

app.listen(port, () => {
     console.log(`Example app listening on port ${port}`)
})
const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const { User } = require("./models/User");
const cookieParser = require('cookie-parser');
const { auth } = require("./middleware/auth");

const config = require("./config/key");

//application/x-www-form-urlencoded 이렇게 된 데이트럴 분석하게 해줌
app.use(bodyParser.urlencoded({ extended: true }));

//application/json 이걸 분석 
app.use(bodyParser.json());
app.use(cookieParser());


const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
     useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected...'))
     .catch(err => console.log(err))

app.get('/', (req, res) => {
     res.send('Hello World! 230930!!!!!!!!!!')
})

//app.post('/register', (req, res) => {
app.post('/api/users/register', async (req, res) => {

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

// 오류남 몽고db6부터 콜백 지원 안한다고 함
// app.post('/api/users/login', (req, res) => {

//      // 요청된 이메일을 데이터베이스에서 찾는다.
//      //User.findOne({ email: req.body.email }, (err, user) => {
//      User.findOne({ email: req.body.email }, (err, user) => {

//           if (!user) {
//                return res.json({
//                     loginSuccess: false,
//                     message: "제공된 이메일에 해당하는 유저가 없습니다."
//                })
//           }

//           // 요청된 이메일이 데이터 베이스에 있다면  비밀번호가 맞는 비밀번호 인지 확인
//           // callback 함수이다 '(err, isMatch) =>' 
//           user.comparePassword(req.body.password, (err, isMatch) => {
//                if (!isMatch)
//                     return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })


//                // 비밀번호 까비 맞다면 토큰을 생성하기.
//                user.generateToken((err, user) => {
//                     if (err) return res.status(400).send(err);

//                     // 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지 아무대나 저장
//                     // 여기선 쿠키로 저장
//                     res.cookie("x_auth", user.token)
//                          .status(200)
//                          .json({ loginSuccess: true, userId: user._id })

//                })
//           })
//      })
// })

app.post('/api/users/login', async (req, res) => {
     console.log(req.body.email);
     try {
          // 
          const user = await User.findOne({ email: req.body.email })
          if (!user) {
               return res.json({
                    loginSuccess: false,
                    message: "제공된 이메일에 해당하는 유저가 없습니다."
               })
          }
          // 요청된 이메일이 데이터 베이스에 있다면  비밀번호가 맞는 비밀번호 인지 확인
          // callback 함수이다 '(err, isMatch) =>' 
          const isMatch = await user.comparePassword(req.body.password)
          if (!isMatch) {
               return res.json({
                    loginSuccess: false,
                    message: "비밀번호가 틀렸습니다."
               })
          }


          // 비밀번호 까비 맞다면 토큰을 생성하기.
          const isgene = await user.generateToken(user);

          // 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지 아무대나 저장
          // 여기선 쿠키로 저장
          res.cookie("x_auth", user.token)
               .status(200)
               .json({ loginSuccess: true, userId: user._id })
          console.log('200 성공');
          console.log(user.token);
     } catch (err) {
          console.log('catch 에러임');
          console.log(err);

     }

})

////role 1 어드민, role 2 특정 부서 어드민 즉. 권한
// role 0 -> 일반유저 role 0이 아니면 관리자

app.get('/api/users/auth', auth, async (req, res) => {

     // 여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 True하는 말.
     res.status(200).json({
          _id: req.user._id,
          isAdmin: req.user.role === 0 ? false : true,
          isAuth: true,
          email: req.user.email,
          name: req.user.name,
          lastname: req.user.lastname,
          role: req.user.role,
          image: req.user.image
     })
})















app.listen(port, () => {
     console.log(`Example app listening on port ${port}`)
})
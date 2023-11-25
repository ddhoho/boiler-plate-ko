const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');


const userSchema = mongoose.Schema({
     name: {
          type: String,
          maxlength: 50
     },
     email: {
          type: String,
          trim: true,
          unique: 1
     },
     password: {
          type: String,
          minlength: 5
     },
     lastname: {
          type: String,
          maxlength: 50
     },
     role: {
          type: Number,
          default: 0
     },
     image: String,
     token: {
          type: String
     },
     tokenExp: {
          type: Number
     }

})

//role 1 어드민, role 2 특정 부서 어드민 즉. 권한


userSchema.pre('save', function (next) {
     var user = this;

     if (user.isModified('password')) {
          // 비밀번호를 암화화 시킨다.
          // to hash password , salt 만들기
          bcrypt.genSalt(saltRounds, function (err, salt) { // bcrypt 사이트에서 복붙
               if (err) return next(err)
               bcrypt.hash(user.password, salt, function (err, hash) {
                    // Store hash in your password DB.
                    if (err) return next(err)
                    user.password = hash
                    next() // 비동기식 함수인 bcrypt.hash을 위해서 써줘야함
               })
          })

     } else {
          next()
     }

})


//comparePassword 함수 만들기
// userSchema.methods.comparePassword = function (plainPassword, cb) {
//      // plainPassword 1234567 , 암호화된 비밀번호 $2b$10$4gIi8uxz1W.uRXrUgH0V7eV4tl7/WYpUiOnJig/8DeFIwH8JvXTXG
//      // 이 두개를 비교하여 비밀번호가 맞는지 확인해야 한다. 근데 암호화된걸 복호화 할순 없다 그래서 비밀번호를 암호화해서 
//      // 암호화된 비밀번호와 비교한다.

//      bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
//           if (err) return cb(err)
//           cb(null, isMatch)
//      })
// }

userSchema.methods.comparePassword = function (plainPassword) {
     return new Promise((resolve, reject) => {
          bcrypt.compare(plainPassword, this.password, (err, isMatch) => {
               if (err) {
                    reject(err)
               } else {
                    resolve(isMatch)
               }
          })
     })
}

userSchema.methods.generateToken = async function (cb) {

     //jsonwebtoken이 es5 기법을 사용함
     var user = this;

     // jsonwebtoken을 이용해서 token을 생성하기
     // _id 인 이유는 몽고db에 들어간 데이터가 아이디가 _id로 되어있다
     var token = jwt.sign(user._id.toHexString(), 'secretToken') // secretToken는 임의로 지은거
     //user._id = 'secretToken' = token
     // =>
     // 'secretToken' => user._id 가 됨

     user.token = token
     //user.save(function (err, user) {
     //user.save(function (user) {
     //if (err) return cb(err)
     //cb(null, user)
     //cb(user)
     //})
     try {
          const savedUser = await user.save(user);
          // 성공적으로 저장된 경우의 로직
          //cb(savedUser); // 이 콜백을 호출해야 하는 경우에만 사용
     } catch (error) {
          // 저장 중에 오류가 발생한 경우의 에러 처리
          console.error(error);
     }


}

userSchema.statics.findByToken = async function (token) {
     var user = this;

     //user._id + '' = token
     //토큰을 decode한다.
     // jwt.verify(token, 'secretToken', function (err, decoded) {
     //      // 유저 아이디를 이용해서 유저를 찾은 다음에
     //      // 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

     //      user.findOne({ "_id": decoded, "token": toekn }, function (err, user) {
     //           if (err) return cb(err);
     //           cb(null, user);
     //      })
     // })

     try {
          const decoded = await jwt.verify(token, 'secretToken');
          const foundUser = await user.findOne({ "_id": decoded, "token": toekn });
          return foundUser;
     } catch (error) {
          console.error(error);
          throw error;

     }


}



const User = mongoose.model('User', userSchema)

module.exports = { User }
const { User } = require('../models/User');

let auth = async (req, res, mext) => {

     // 인증 처리를 하는곳

     // 클라이언트 쿠키에서 토큰을 가져온다.
     let token = req.cookies.x_auth;


     // 토큰을 복호화 한후 유저를 찾는다.
     // User.findByToekn(token, (err, user) => {
     //      if (err) throw err;
     //      if (!user) return res.json({ isAuth: false, error: true })

     //      req.token = token;
     //      req.user = user;
     //      next(); // 이게 없으면 middle웨어에 갇혀버림 다 할거 했으면 다음으로 가기 위해 써준다

     // });

     try {

          const user = await User.findByToken(token);
          if (!user) {
               return res.json({ isAuth: false, error: true });
          }

          req.token = token;
          req.user = user;
          next();
     } catch (error) {
          console.error(error);
          return res.json({ isAuth: false, error: true });

     }
}




module.exports = { auth };
const express = require("express");
const bcryptjs = require("bcryptjs");
const User = require("../models/user"); 
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");

authRouter.use(express.json());

// Đăng ký tài khoản thông thường
authRouter.post("/api/signup", async (req, res) => {
    try {
        const {name, email, password} = req.body;
        
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({msg: "User with same email already exists!"});
        }

        const hashedPassword = await bcryptjs.hash(password, 8);
        let user = new User({
            name,
            email,
            password: hashedPassword,
            type: 'user',
            address: '',
            cart: [],           
        });
        
        user = await user.save();
        res.json(user);
    } catch(e) {
        res.status(500).json({error: e.message});
    }
}); 

// Đăng nhập thông thường
authRouter.post("/api/signin", async (req, res) => {
    try {
        const {email, password} = req.body;
        
        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({msg: "User with this email does not exist!"});
        }
        
        const isMatch = await bcryptjs.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({msg: "Incorrect password."});
        }
        
        const token = jwt.sign({id: user._id}, "passwordKey");
        res.json({token, ...user._doc});
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});   

// Đăng nhập bằng Google
authRouter.post("/api/google-signin", async (req, res) => {
    try {
        const {email, name, googleId} = req.body;

        // Tìm user theo googleId hoặc email
        let user = await User.findOne({ 
            $or: [
                { googleId: googleId },
                { email: email }
            ]
        });

        if (!user) {
            // Tạo user mới nếu chưa tồn tại
            user = new User({
                email,
                name,
                googleId,
                type: 'user',
                address: '',
                cart: [],
            });
            user = await user.save();
        } else if (!user.googleId) {
            // Nếu user đã tồn tại nhưng chưa có googleId
            user.googleId = googleId;
            await user.save();
        }

        const token = jwt.sign({id: user._id}, "passwordKey");
        res.json({token, ...user._doc});

    } catch(e) {
        res.status(500).json({error: e.message});
    }
});

// Kiểm tra token hợp lệ
authRouter.post("/tokenIsValid", async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if(!token) return res.json(false);
        
        const verified = jwt.verify(token, "passwordKey");
        if(!verified) return res.json(false);
        
        const user = await User.findById(verified.id);
        if(!user) return res.json(false);
        
        res.json(true);
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});  

// Lấy thông tin user
authRouter.get("/", auth, async(req, res) => {
    const user = await User.findById(req.user);
    res.json({...user._doc, token: req.token});
}); 

// Thêm route reset password
// Thêm route quên mật khẩu
authRouter.post("/api/forgot-password", async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      
      // Tìm user theo email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: "Email không tồn tại trong hệ thống!" });
      }
  
      // Hash mật khẩu mới
      const hashedPassword = await bcryptjs.hash(newPassword, 8);
      user.password = hashedPassword;
      await user.save();
  
      res.json({ msg: "Đặt lại mật khẩu thành công!" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

module.exports = authRouter;
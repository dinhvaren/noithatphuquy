const Users = require('../models/Users'); // Model User
const bcrypt = require('bcryptjs'); // Thư viện mã hóa mật khẩu
const jwt = require('jsonwebtoken'); // JWT để tạo token đăng nhập
const mongoose = require('mongoose'); // Thêm mongoose để tạo ObjectId

class HomeController {
    // Hiển thị trang chủ
    home(req, res, next) {
        res.render('home');
    }

    // Xử lý đăng nhập
    login(req, res, next) {
        const { email, password } = req.body;
        const SECRET_KEY = process.env.JWT_SECRET; // Chỉ khai báo 1 lần

        Users.findOne({ email })
            .then(user => {
                if (!user) {
                    return Promise.reject({ status: 400, message: 'Email không tồn tại' });
                }

                return bcrypt.compare(password, user.password)
                    .then(isMatch => {
                        if (!isMatch) {
                            return Promise.reject({ status: 400, message: 'Sai mật khẩu' });
                        }

                        // Tạo token JWT
                        const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
                            expiresIn: '1h',
                        });

                        res.json({ message: 'Đăng nhập thành công', token });
                    });
            })
            .catch(err => {
                res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
            });
    }

    // Xử lý đăng ký
    signup(req, res, next) {
        const { name, email, phone, password, confirm_password, address } = req.body;

        if (password !== confirm_password) {
            return res.status(400).json({ message: 'Mật khẩu không khớp' });
        }

        Users.findOne({ email })
            .then(existingUser => {
                if (existingUser) {
                    return Promise.reject({ status: 400, message: 'Email đã được sử dụng' });
                }

                return bcrypt.hash(password, 10);
            })
            .then(hashedPassword => {
                const newUser = new Users({
                    _id: new mongoose.Types.ObjectId(), // Thêm ObjectId
                    name,
                    email,
                    phone,
                    password: hashedPassword,
                    address: address || '', // Nếu không có address, đặt giá trị rỗng
                });

                return newUser.save(); // Lưu vào DB
            })
            .then(user => {
                res.status(201).json({ message: 'Đăng ký thành công', user });
            })
            .catch(err => {
                res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
            });
    }
}

module.exports = new HomeController();

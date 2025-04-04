const { User } = require('../models/index');
const bcrypt = require('bcryptjs');

class UserController {

    // Hiển thị trang thông tin cá nhân
    profile(req, res, next) {
        try {
            res.render('pages/profile', { 
                page: { title: 'Thông tin cá nhân' },
                user: req.user
            });
        } catch (error) {
            console.error('Lỗi hiển thị trang profile:', error);
            next(error);
        }
    }

    // Hiển thị trang danh sách đơn hàng
    orders(req, res, next) {
        res.render('pages/Orders', { 
            page: { title: 'Danh sách đơn hàng' },
            user: req.user
        });
    }

    // Hiển thị trang danh sách yêu thích
    wishlist(req, res, next) {
        res.render('pages/Wishlist', { 
            page: { title: 'Danh sách yêu thích' },
            user: req.user
        });
    }

    // Hiển thị trang đổi mật khẩu
    changePassword(req, res, next) {
        res.render('pages/ChangePassword', { 
            page: { title: 'Đổi mật khẩu' },
            user: req.user
        });
    }

    // Xử lý đổi mật khẩu
    async handleChangePassword(req, res) {
        try {
            const { currentPassword, newPassword, confirmNewPassword } = req.body;
            const userId = req.user.id;

            // Kiểm tra mật khẩu mới và xác nhận mật khẩu
            if (newPassword !== confirmNewPassword) {
                return res.render('pages/ChangePassword', {
                    page: { title: 'Đổi mật khẩu' },
                    user: req.user,
                    error: 'Mật khẩu mới không khớp'
                });
            }

            // Tìm user trong database
            const user = await User.findById(userId);
            if (!user) {
                return res.render('pages/ChangePassword', {
                    page: { title: 'Đổi mật khẩu' },
                    user: req.user,
                    error: 'Không tìm thấy người dùng'
                });
            }

            // Kiểm tra mật khẩu hiện tại
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.render('pages/ChangePassword', {
                    page: { title: 'Đổi mật khẩu' },
                    user: req.user,
                    error: 'Mật khẩu hiện tại không đúng'
                });
            }

            // Mã hóa mật khẩu mới
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Cập nhật mật khẩu mới
            user.password = hashedPassword;
            await user.save();

            // Render trang với thông báo thành công
            res.render('pages/ChangePassword', {
                page: { title: 'Đổi mật khẩu' },
                user: req.user,
                successMessage: 'Đổi mật khẩu thành công'
            });
        } catch (error) {
            console.error('Lỗi đổi mật khẩu:', error);
            res.render('pages/ChangePassword', {
                page: { title: 'Đổi mật khẩu' },
                user: req.user,
                error: 'Có lỗi xảy ra, vui lòng thử lại sau'
            });
        }
    }

    // Xử lý cập nhật thông tin cá nhân
    updateProfile(req, res) {
        try {
            const { fullName, phone, address, birthday } = req.body;
            const avatar = req.file ? '/uploads/' + req.file.filename : null;

            // Cập nhật thông tin user
            const updateData = { fullName, phone, address, birthday };
            if (avatar) {
                updateData.avatar = avatar;
            }

            User.findByIdAndUpdate(req.user._id, updateData, { new: true })
                .then(user => {
                    if (!user) {
                        return res.status(404).json({ error: 'Không tìm thấy user' });
                    }
                    res.redirect('/profile');
                })
                .catch(error => {
                    console.error('Lỗi khi cập nhật thông tin:', error);
                    return res.status(500).json({ error: 'Lỗi server' });
                });
        } catch (error) {
            console.error('Lỗi khi xử lý yêu cầu:', error);
            return res.status(500).json({ error: 'Lỗi server' });
        }
    }
    
}

module.exports = new UserController(); 
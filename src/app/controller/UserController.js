const { User } = require('../models/index');
const bcrypt = require('bcryptjs');
const cloudinaryService = require('../services/cloudinaryService');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("Cloudinary được cấu hình với:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.substring(0, 4) + "..." : undefined,
    api_secret: process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.substring(0, 4) + "..." : undefined
});

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
    async updateProfile(req, res) {
        try {
            console.log('Đang xử lý cập nhật profile với body:', req.body);
            console.log('File upload:', req.file);
            
            const { fullName, phone, address, birthday } = req.body;
            let avatarUrl = null;

            // Nếu có file được upload
            if (req.file) {
                try {
                    console.log('Phát hiện file upload, đường dẫn tạm:', req.file.path);
                    
                    // Đọc file thành buffer
                    const fileBuffer = fs.readFileSync(req.file.path);
                    console.log('Đã đọc file thành buffer, kích thước:', fileBuffer.length, 'bytes');
                    
                    // Encode file thành base64
                    const base64Image = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
                    console.log('Đã encode file thành base64, độ dài chuỗi:', base64Image.length);
                    
                    // Upload ảnh lên Cloudinary
                    const result = await cloudinary.uploader.upload(
                        base64Image,
                        {
                            folder: "avatars",
                            use_filename: true,
                            unique_filename: true
                        }
                    );
                    
                    avatarUrl = result.secure_url;
                    console.log('URL ảnh từ Cloudinary:', avatarUrl);
                    
                    // Xóa file tạm sau khi đã upload lên Cloudinary
                    fs.unlinkSync(req.file.path);
                    console.log('Đã xóa file tạm sau khi upload');
                } catch (error) {
                    console.error('Lỗi chi tiết khi upload ảnh:', error);
                }
            } else {
                console.log('Không có file được upload');
            }

            // Cập nhật thông tin user
            const updateData = { fullName, phone, address, birthday };
            if (avatarUrl) {
                updateData.avatar = avatarUrl;
                console.log('Cập nhật avatar mới:', avatarUrl);
            }

            console.log('Dữ liệu cập nhật:', updateData);
            const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });
            
            if (!user) {
                console.log('Không tìm thấy user với ID:', req.user._id);
                return res.status(404).json({ error: 'Không tìm thấy user' });
            }
            
            console.log('Cập nhật thành công, user mới:', user);
            res.redirect('/profile');
        } catch (error) {
            console.error('Lỗi chi tiết khi xử lý yêu cầu:', error);
            return res.status(500).json({ error: 'Lỗi server' });
        }
    }
    
}

module.exports = new UserController(); 
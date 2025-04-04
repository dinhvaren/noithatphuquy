const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloudinary được cấu hình với cloud_name:', process.env.CLOUDINARY_CLOUD_NAME);

class CloudinaryService {
    // Upload ảnh lên Cloudinary
    async uploadImage(filePath, options = {}) {
        try {
            console.log('Bắt đầu upload ảnh lên Cloudinary từ đường dẫn:', filePath);
            
            // Kiểm tra xem file có tồn tại không
            if (!fs.existsSync(filePath)) {
                throw new Error(`File không tồn tại: ${filePath}`);
            }
            
            // Kiểm tra kích thước file
            const fileStats = fs.statSync(filePath);
            console.log('Kích thước file:', fileStats.size, 'bytes');
            
            if (fileStats.size === 0) {
                throw new Error('File trống, không thể upload');
            }

            const defaultOptions = {
                folder: 'products',
                use_filename: true,
                unique_filename: true,
                transformation: [
                    { width: 800, height: 800, crop: 'limit' }
                ]
            };
            
            // Merge options với defaultOptions
            const uploadOptions = { ...defaultOptions, ...options };
            
            // Sử dụng promise để theo dõi kết quả upload
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload(
                    filePath, 
                    uploadOptions,
                    (error, result) => {
                        // Xóa file tạm sau khi upload
                        fs.unlink(filePath, err => {
                            if (err) console.error('Lỗi xóa file tạm:', err);
                        });

                        if (error) {
                            console.error('Lỗi chi tiết từ Cloudinary:', error);
                            reject(error);
                        } else {
                            console.log('Upload thành công, kết quả:', result);
                            resolve(result);
                        }
                    }
                );
            });
        } catch (error) {
            console.error('Lỗi khi upload ảnh lên Cloudinary:', error);
            throw error;
        }
    }

    // Xóa ảnh khỏi Cloudinary
    async deleteImage(publicId) {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result;
        } catch (error) {
            console.error('Lỗi khi xóa ảnh từ Cloudinary:', error);
            throw error;
        }
    }
}

module.exports = new CloudinaryService(); 
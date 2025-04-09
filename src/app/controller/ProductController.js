const { Product, Category } = require('../models/index');
const cloudinaryService = require('../services/cloudinaryService');
const slugify = require('slugify');

class ProductController {
    // [GET] /products
    index(req, res) {
        
    }

    // [GET] /products/:id
    show(req, res) {
        
    }

    // [POST] /products/create
    create(req, res) {
        
    }

    // [PUT] /products/:id
    update(req, res) {
        
    }

    // [DELETE] /products/:id
    delete(req, res) {
        
    }

    // [GET] /products/category/:categoryId
    getByCategory(req, res) {
        
    }

    // [GET] /products/search
    search(req, res) {
        
    }

    // Modal thêm sản phẩm mới
    async createProductModal(req, res, next) {
        try {
            if (req.method === 'GET') {
                // Nếu là GET request, hiển thị trang thêm sản phẩm
                const categories = await Category.find().lean();
                return res.render('admin/AddProduct', {
                    page: { title: 'Thêm sản phẩm mới' },
                    categories,
                    user: req.user
                });
            }

            // Nếu là POST request, xử lý thêm sản phẩm
            const {
                name,
                price,
                salePrice,
                category,
                description,
                isActive,
                specifications
            } = req.body;

            console.log('=== BẮT ĐẦU TẠO SẢN PHẨM MỚI ===');
            console.log('Dữ liệu nhận được:', req.body);
            console.log('Files:', req.files);

            // Kiểm tra dữ liệu bắt buộc
            if (!name || !price || !category || !description) {
                return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
            }

            // Xử lý upload ảnh lên Cloudinary
            let imageUrls = [];
            if (req.files && req.files.length > 0) {
                console.log(`Bắt đầu upload ${req.files.length} ảnh lên Cloudinary`);
                
                // Upload từng ảnh lên Cloudinary
                const uploadPromises = req.files.map(file => {
                    return new Promise((resolve, reject) => {
                        cloudinaryService.uploadImage(file.path)
                            .then(result => {
                                console.log('Upload ảnh thành công:', result.secure_url);
                                resolve(result.secure_url);
                            })
                            .catch(error => {
                                console.error('Lỗi upload ảnh:', error);
                                reject(error);
                            });
                    });
                });
                
                // Đợi tất cả các ảnh được upload
                imageUrls = await Promise.all(uploadPromises);
                console.log('Tất cả ảnh đã được upload:', imageUrls);
            }

            // Tạo mã sản phẩm tự động
            const code = 'SP' + Date.now().toString().slice(-6);

            // Xử lý specifications
            const specs = JSON.parse(JSON.stringify(req.body));
            
            // Tạo object specifications
            const productSpecifications = {
                material: specs.material || '',
                color: specs.color || '',
                size: {
                    length: specs['specifications[size][length]'] || 0,
                    width: specs['specifications[size][width]'] || 0,
                    height: specs['specifications[size][height]'] || 0
                },
                warranty: specs['specifications[warranty]'] || 0
            };

            console.log('Thông số sản phẩm:', productSpecifications);

            // Tạo slug từ tên sản phẩm
            const slug = slugify(name, {
                lower: true,      // Chuyển thành chữ thường
                strict: true,     // Chỉ giữ lại ký tự và số
                locale: 'vi'      // Hỗ trợ tiếng Việt
            });

            // Tạo sản phẩm mới
            const product = new Product({
                name,
                code,
                slug,
                price: parseFloat(price),
                salePrice: salePrice ? parseFloat(salePrice) : null,
                categoryId: category,
                description,
                images: imageUrls,
                isActive: isActive === 'true',
                specifications: productSpecifications
            });

            console.log('Sản phẩm sẽ được tạo:', product);

            // Lưu sản phẩm
            const savedProduct = await product.save();
            console.log('=== TẠO SẢN PHẨM THÀNH CÔNG ===');

            // Chuyển hướng về trang danh sách sản phẩm
            return res.redirect('/admin');
        } catch (error) {
            console.error('=== LỖI KHI TẠO SẢN PHẨM ===', error);
            // Nếu có lỗi validation, trả về thông báo lỗi chi tiết
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    message: 'Dữ liệu không hợp lệ',
                    errors: Object.values(error.errors).map(err => err.message)
                });
            }
            return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau' });
        }
    }

    // Modal chỉnh sửa sản phẩm
    async editProductModal(req, res, next) {
        try {
            const productId = req.params.id;
            const product = await Product.findById(productId)
                .populate('categoryId')
                .lean();

            if (!product) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Không tìm thấy sản phẩm' 
                });
            }

            // Chuyển đổi categoryId thành tên category
            product.category = product.categoryId.name;
            delete product.categoryId;

            res.json({
                success: true,
                data: product
            });
        } catch (error) {
            console.error('Lỗi khi lấy thông tin sản phẩm:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Lỗi server, vui lòng thử lại sau' 
            });
        }
    }

    // Cập nhật sản phẩm
    async updateProductModal(req, res, next) {
        try {
            console.log('=== BẮT ĐẦU CẬP NHẬT SẢN PHẨM ===');
            const productId = req.params.id;
            
            // Kiểm tra sản phẩm tồn tại
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            }

            const {
                name,
                price,
                salePrice,
                category,
                description,
                isActive,
                specifications,
                existingImages
            } = req.body;

            console.log('Dữ liệu nhận được:', req.body);
            console.log('Files:', req.files);

            // Kiểm tra dữ liệu bắt buộc
            if (!name || !price || !category || !description) {
                return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
            }

            // Xử lý ảnh hiện có (nếu có)
            let imageUrls = [];
            if (existingImages) {
                // Nếu existingImages là một string, chuyển thành array
                if (typeof existingImages === 'string') {
                    imageUrls = [existingImages];
                } else {
                    imageUrls = existingImages;
                }
            }

            // Xử lý upload ảnh mới lên Cloudinary (nếu có)
            if (req.files && req.files.length > 0) {
                console.log(`Bắt đầu upload ${req.files.length} ảnh mới lên Cloudinary`);
                
                // Upload từng ảnh lên Cloudinary
                const uploadPromises = req.files.map(file => {
                    return new Promise((resolve, reject) => {
                        cloudinaryService.uploadImage(file.path)
                            .then(result => {
                                console.log('Upload ảnh thành công:', result.secure_url);
                                resolve(result.secure_url);
                            })
                            .catch(error => {
                                console.error('Lỗi upload ảnh:', error);
                                reject(error);
                            });
                    });
                });
                
                // Đợi tất cả các ảnh được upload
                const newImageUrls = await Promise.all(uploadPromises);
                console.log('Tất cả ảnh mới đã được upload:', newImageUrls);
                
                // Kết hợp ảnh cũ và ảnh mới
                imageUrls = [...imageUrls, ...newImageUrls];
            }

            // Xử lý specifications
            const specs = JSON.parse(JSON.stringify(req.body));
            
            // Tạo object specifications
            const productSpecifications = {
                material: specs.material || '',
                color: specs.color || '',
                size: {
                    length: specs['specifications[size][length]'] || 0,
                    width: specs['specifications[size][width]'] || 0,
                    height: specs['specifications[size][height]'] || 0
                },
                warranty: specs['specifications[warranty]'] || 0
            };

            console.log('Thông số sản phẩm:', productSpecifications);

            // Cập nhật sản phẩm
            const updateData = {
                name,
                price: parseFloat(price),
                salePrice: salePrice ? parseFloat(salePrice) : undefined,
                categoryId: category,
                description,
                isActive: isActive === 'true',
                specifications: productSpecifications
            };

            // Chỉ cập nhật images nếu có thay đổi
            if (imageUrls.length > 0) {
                updateData.images = imageUrls;
            }

            console.log('Dữ liệu cập nhật:', updateData);

            // Lưu sản phẩm đã cập nhật
            const updatedProduct = await Product.findByIdAndUpdate(
                productId,
                updateData,
                { new: true, runValidators: true }
            );

            console.log('=== CẬP NHẬT SẢN PHẨM THÀNH CÔNG ===');

            // Chuyển hướng về trang danh sách sản phẩm
            return res.redirect('/admin');
        } catch (error) {
            console.error('=== LỖI KHI CẬP NHẬT SẢN PHẨM ===', error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    message: 'Dữ liệu không hợp lệ',
                    errors: Object.values(error.errors).map(err => err.message)
                });
            }
            return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau' });
        }
    }

    // Xem chi tiết sản phẩm
    viewProductModal(req, res, next) {
        const productId = req.params.id;
        res.render('modals/viewProduct', { layout: false, productId });
    }

    // Xóa sản phẩm
    async deleteProductModal(req, res, next) {
        try {
            console.log('=== BẮT ĐẦU XÓA SẢN PHẨM ===');
            const productId = req.params.id;
            
            // Tìm sản phẩm để lấy thông tin ảnh
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            }

            console.log('Thông tin sản phẩm sẽ xóa:', product);

            // Xóa ảnh trên Cloudinary
            if (product.images && product.images.length > 0) {
                for (const imageUrl of product.images) {
                    try {
                        // Lấy public_id từ URL
                        const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
                        await cloudinaryService.deleteImage(publicId);
                        console.log('Đã xóa ảnh:', publicId);
                    } catch (error) {
                        console.error('Lỗi khi xóa ảnh:', error);
                    }
                }
            }

            // Xóa sản phẩm khỏi database
            await Product.findByIdAndDelete(productId);
            console.log('=== XÓA SẢN PHẨM THÀNH CÔNG ===');

            // Redirect về trang admin
            res.redirect('/admin');
        } catch (error) {
            console.error('=== LỖI KHI XÓA SẢN PHẨM ===', error);
            next(error);
        }
    }
}

module.exports = new ProductController(); 
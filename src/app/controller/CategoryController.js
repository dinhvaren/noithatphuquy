const { Category, CategoryParent } = require('../models/index');

class CategoryController {
    // [GET] /categories
    index(req, res) {
        
    }

    // [GET] /categories/:id
    show(req, res) {
        
    }

    // [POST] /categories/create
    create(req, res) {
        
    }

    // [PUT] /categories/:id
    update(req, res) {
        
    }

    // [DELETE] /categories/:id
    delete(req, res) {
        
    }

    // Modal thêm mới danh mục
    async addCategoryModal(req, res) {
        const parentCategories = await CategoryParent.find({});
        res.render('modals/addCategory', { layout: false, parentCategories });
    }

    // Modal chỉnh sửa danh mục
    async editCategoryModal(req, res) {
        const categoryId = req.params.id;
        const category = await Category.findById(categoryId);
        const parentCategories = await CategoryParent.find({});
        res.render('modals/editCategory', { layout: false, category, parentCategories });
    }

    // Cập nhật danh mục
    updateCategoryModal(req, res, next) {
        console.log('=== BẮT ĐẦU CẬP NHẬT DANH MỤC ===');
        console.log('ID danh mục cần cập nhật:', req.params.id);
        console.log('Dữ liệu cập nhật:', req.body);
        
        const { name, description, isActive } = req.body;
        
        Category.updateOne(
            { _id: req.params.id },
            { 
                name,
                description,
                isActive: isActive === 'true'
            }
        )
        .then((result) => {
            console.log('Kết quả cập nhật:', result);
            console.log('=== CẬP NHẬT DANH MỤC THÀNH CÔNG ===');
            res.redirect('back');
        })
        .catch((error) => {
            console.error('=== LỖI KHI CẬP NHẬT DANH MỤC ===', error);
            next(error);
        });
    }

    // Tạo danh mục mới
    async createCategoryModal(req, res, next) {
        try {
            console.log('=== BẮT ĐẦU TẠO DANH MỤC MỚI ===');
            console.log('Dữ liệu nhận được:', req.body);
            
            const { name, description, parent_id, isActive } = req.body;

            // Kiểm tra dữ liệu bắt buộc
            if (!name) {
                return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });
            }
            
            // Tạo slug từ tên danh mục
            const slug = name.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            // Tìm danh mục cha dựa trên _id
            let parentCategory = null;
            if (parent_id) {
                parentCategory = await CategoryParent.findById(parent_id);
                console.log('Danh mục cha:', parentCategory);
            }
            
            const category = new Category({
                name,
                slug,
                description,
                parent_id: parentCategory ? parentCategory._id : null,
                isActive: isActive === 'true'
            });

            console.log('Danh mục sẽ được tạo:', category);
            await category.save();
            console.log('=== TẠO DANH MỤC THÀNH CÔNG ===');
            
            res.status(200).json({ message: 'Tạo danh mục thành công' });
        } catch (error) {
            console.error('=== LỖI KHI TẠO DANH MỤC ===', error);
            res.status(500).json({ message: 'Có lỗi xảy ra khi tạo danh mục' });
        }
    }

    // Xóa danh mục
    async deleteCategoryModal(req, res, next) {
        try {
            console.log('=== BẮT ĐẦU XÓA DANH MỤC ===');
            const categoryId = req.params.id;
            console.log('ID danh mục cần xóa:', categoryId);
            
            // Kiểm tra xem danh mục có tồn tại không
            const category = await Category.findById(categoryId);
            if (!category) {
                console.log('Không tìm thấy danh mục với ID:', categoryId);
                return res.status(404).json({ message: 'Không tìm thấy danh mục' });
            }

            console.log('Thông tin danh mục sẽ xóa:', category);

            // Xóa danh mục khỏi database
            await Category.findByIdAndDelete(categoryId);
            console.log('=== XÓA DANH MỤC THÀNH CÔNG ===');

            // Redirect về trang admin
            res.redirect('/admin');
        } catch (error) {
            console.error('=== LỖI KHI XÓA DANH MỤC ===', error);
            next(error);
        }
    }
}

module.exports = new CategoryController(); 
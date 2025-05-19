const { Category, CategoryParent } = require('../models/index');

class CategoryController {
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
            res.redirect('back');
        })
        .catch((error) => {
            next(error);
        });
    }

    // Tạo danh mục mới
    async createCategoryModal(req, res, next) {
        try {            
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
            }
            
            const category = new Category({
                name,
                slug,
                description,
                parent_id: parentCategory ? parentCategory._id : null,
                isActive: isActive === 'true'
            });

            await category.save();
            
            res.status(200).json({ message: 'Tạo danh mục thành công' });
        } catch (error) {
            res.status(500).json({ message: 'Có lỗi xảy ra khi tạo danh mục' });
        }
    }

    // Xóa danh mục
    async deleteCategoryModal(req, res, next) {
        try {
            const categoryId = req.params.id;
            console.log('ID danh mục cần xóa:', categoryId);
            
            // Kiểm tra xem danh mục có tồn tại không
            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(404).json({ message: 'Không tìm thấy danh mục' });
            }
            // Xóa danh mục khỏi database
            await Category.findByIdAndDelete(categoryId);

            // Redirect về trang admin
            res.redirect('/admin');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CategoryController(); 
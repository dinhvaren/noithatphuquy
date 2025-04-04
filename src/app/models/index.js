const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema cho danh mục sản phẩm (Categories)
const CategorySchema = new Schema({
    name: { type: String, required: true }, // Tên danh mục
    description: String, // Mô tả danh mục
    image: String, // Ảnh danh mục
    slug: String, // Slug danh mục
    keywords: [String], // Từ khóa tìm kiếm
    isActive: { type: Boolean, default: true }, // Trạng thái hoạt động
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Schema cho sản phẩm (Products)
const ProductSchema = new Schema({
    name: { type: String, required: true }, // Tên sản phẩm
    code: { type: String, required: true, unique: true }, // Mã sản phẩm
    description: String, // Mô tả sản phẩm
    price: { type: Number, required: true }, // Giá gốc
    slug: String, // Slug sản phẩm
    salePrice: { type: Number }, // Giá khuyến mãi
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true }, // ID danh mục
    images: [String], // Mảng các ảnh sản phẩm
    specifications: { // Thông số kỹ thuật
        material: String, // Chất liệu
        size: { // Kích thước
            length: Number,
            width: Number,
            height: Number
        },
        color: String, // Màu sắc
        warranty: Number // Thời gian bảo hành (tháng)
    },
    stock: { type: Number, default: 0 }, // Số lượng tồn kho
    isActive: { type: Boolean, default: true }, // Trạng thái hoạt động
    isFeatured: { type: Boolean, default: false }, // Sản phẩm nổi bật
    isNewArrival: { type: Boolean, default: false }, // Sản phẩm mới
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Schema cho người dùng (Users)
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    phone: String,
    address: String,
    avatar: String,
    birthday: Date,
    role: { type: String, enum: ['user', 'admin', 'staff'], default: 'user' },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    permissions: [{
        type: String,
        enum: ['read_products', 'write_products', 'manage_users', 'manage_orders', 'manage_categories']
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Schema cho giỏ hàng (Carts)
const CartSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true }, // Giá tại thời điểm thêm vào giỏ
        name: String, // Tên sản phẩm tại thời điểm thêm vào giỏ
        image: String // Ảnh sản phẩm tại thời điểm thêm vào giỏ
    }],
    totalAmount: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});

// Schema cho đơn hàng (Orders)
const OrderSchema = new Schema({
    orderNumber: { type: String, required: true, unique: true }, // Mã đơn hàng
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // Giá tại thời điểm đặt hàng
        name: String, // Tên sản phẩm tại thời điểm đặt hàng
        image: String // Ảnh sản phẩm tại thời điểm đặt hàng
    }],
    totalAmount: { type: Number, required: true },
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        ward: { type: String, required: true },
        district: { type: String, required: true },
        city: { type: String, required: true }
    },
    paymentMethod: { type: String, required: true, enum: ['COD', 'Banking'] },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Shipping', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    note: String, // Ghi chú đơn hàng
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Schema cho đánh giá sản phẩm (Reviews)
const ReviewSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
    images: [String], // Ảnh đánh giá
    isVerified: { type: Boolean, default: false }, // Đã xác minh mua hàng
    createdAt: { type: Date, default: Date.now }
});

// Schema cho tin tức/bài viết (Posts)
const PostSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: String,
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, enum: ['News', 'Blog', 'Design'] },
    tags: [String],
    isPublished: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Schema cho liên hệ (Contacts)
const ContactSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    subject: String,
    message: { type: String, required: true },
    status: { type: String, enum: ['New', 'Processing', 'Resolved'], default: 'New' },
    createdAt: { type: Date, default: Date.now }
});

// Schema cho danh sách yêu thích (Wishlist)
const WishlistSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Thêm index cho userId và productId để tối ưu truy vấn
WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Tạo models
const Category = mongoose.model('Category', CategorySchema);
const Product = mongoose.model('Product', ProductSchema);
const User = mongoose.model('User', UserSchema);
const Cart = mongoose.model('Cart', CartSchema);
const Order = mongoose.model('Order', OrderSchema);
const Review = mongoose.model('Review', ReviewSchema);
const Post = mongoose.model('Post', PostSchema);
const Contact = mongoose.model('Contact', ContactSchema);
const Wishlist = mongoose.model('Wishlist', WishlistSchema);

// Hàm tính phần trăm giảm giá
const calculateDiscountPercentage = (originalPrice, salePrice) => {
    if (!originalPrice || !salePrice || originalPrice <= 0) return 0;
    const discount = ((originalPrice - salePrice) / originalPrice) * 100;
    return Math.round(discount); // Làm tròn số phần trăm
};

// Export models
module.exports = {
    calculateDiscountPercentage,
    Category,
    Product,
    User,
    Cart,
    Order,
    Review,
    Post,
    Contact,
    Wishlist
}; 
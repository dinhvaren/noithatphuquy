const mongoose = require('mongoose');
const slugify = require('slugify');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const Schema = mongoose.Schema;
const Users = new Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        address: { type: String, required: false },
        phone: { type: String, required: true },
        role: {
            type: String,
            enum: ['customer', 'admin'],
            default: 'customer',
        },
        orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    },
    { timestamps: true },
);
Users.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    if (!this.slug) {
        // Nếu slug chưa được tạo, tiến hành tạo slug từ tên sản phẩm
        let newSlug = slugify(this.name, { lower: true, strict: true });

        // Kiểm tra xem slug đã tồn tại trong database chưa
        let existingCourse = await mongoose
            .model('Users')
            .findOne({ slug: newSlug });

        let counter = 1; // Biến đếm để tạo slug duy nhất nếu bị trùng
        while (existingCourse) {
            // Nếu slug đã tồn tại, thêm số thứ tự vào cuối để tránh trùng lặp
            newSlug = `${slugify(this.name, { lower: true, strict: true })}-${counter}`;
            existingCourse = await mongoose
                .model('Users')
                .findOne({ slug: newSlug });
            counter++; // Tăng biến đếm để thử slug mới
        }

        this.slug = newSlug; // Gán slug mới vào tài liệu trước khi lưu
    }
    next(); // Tiếp tục quá trình lưu vào database
});

Users.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});
module.exports = mongoose.model('Users', Users);

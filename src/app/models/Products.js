const mongoose = require('mongoose');
const slugify = require('slugify');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const Products = new Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        name: { type: String, required: true },
        category: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        stock: { type: Number, required: true },
        images: [{ type: String }],
        dimensions: {
            width: { type: Number, required: true },
            height: { type: Number, required: true },
            depth: { type: Number, required: true },
        },
        material: { type: String, required: true },
        rating: { type: Number, default: 0 },
        reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    },
    { timestamps: true },
);

module.exports = mongoose.model('Products', Products);

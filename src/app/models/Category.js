const mongoose = require('mongoose');
const { Schema } = mongoose;

const Category = new Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        name: { type: String, required: true, unique: true },
        description: { type: String },
        parent_category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            default: null,
        },
        subcategories: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        ],
    },
    { timestamps: true },
);

module.exports = mongoose.model('Category', Category);

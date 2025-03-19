const mongoose = require('mongoose');
const { Schema } = mongoose;

const Reviews = new Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Review', Reviews);

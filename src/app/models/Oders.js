const mongoose = require('mongoose');
const { Schema } = mongoose;

const Order = new Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [
            {
                product_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                name: { type: String, required: true },
                quantity: { type: Number, required: true, min: 1 },
                price: { type: Number, required: true },
            },
        ],
        total_price: { type: Number, required: true },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Order', Order);

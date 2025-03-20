const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

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

Users.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});
module.exports = mongoose.model('Users', Users);

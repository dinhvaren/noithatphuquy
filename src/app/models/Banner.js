const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true,
    },
    link: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;

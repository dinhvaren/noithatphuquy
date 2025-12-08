const mongoose = require('mongoose');
require('dotenv').config();

function connect() {

    mongoose.connect(
        process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Kết nối MongoDB thành công'))
    .catch(err => console.error('Lỗi kết nối MongoDB:', err));
    
}

module.exports = { connect };

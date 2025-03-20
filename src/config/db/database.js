const mongoose = require('mongoose');

function connect() {

    mongoose.connect('mongodb://localhost:27017/NoiThatPhuQuy', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('🔗 Kết nối MongoDB thành công'))
    .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));
    
}

module.exports = { connect };

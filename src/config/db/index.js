const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect('mongodb://localhost:27017/NoiThatPhuQuy');
        console.log('Connected!');
    } catch (error) {
        console.log('Failure!');
    }
}

module.exports = { connect };

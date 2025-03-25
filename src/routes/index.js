const { home } = require('../app/controller/HomeController');
const homeRouter = require('./home');
const adminRouter = require('./admin');
const cartRouter = require('./cart');
function route(app) {
    app.use('/', homeRouter);
    app.use('/admin', adminRouter);
    app.use('/cart', cartRouter);
}

module.exports = route;

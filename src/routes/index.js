const { home } = require('../app/controller/HomeController');
const homeRouter = require('./home');
function route(app) {
    app.use('/', homeRouter);
}

module.exports = route;

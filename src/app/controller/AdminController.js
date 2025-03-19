class AdminController {
    index(req, res, next) {
        res.render('admin');
    }
}

module.exports = new AdminController();

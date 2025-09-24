const { home } = require("../app/controller/HomeController");
const CheckPermission = require("../app/middlewares/CheckPermission");
const cartMiddleware = require("../app/middlewares/cartMiddleware");

const homeRouter = require("./home");
const adminRouter = require("./admin");
const cartRouter = require("./cart");

function route(app) {
  // Public + attach user nếu có (token optional)
  app.use(CheckPermission.attachUser);

  // Middleware cart (luôn cần, kể cả user chưa login -> giỏ rỗng)
  app.use(cartMiddleware);

  // Public routes
  app.use("/", homeRouter);
  app.use("/admin", adminRouter);

  // Cart routes (yêu cầu đăng nhập)
  app.use("/cart", CheckPermission.verifyToken, cartRouter);
}

module.exports = route;

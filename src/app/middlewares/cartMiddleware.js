const { Cart } = require("../models");

async function cartMiddleware(req, res, next) {
  try {
    let cart = null;

    if (req.user) {
      cart = await Cart.findOne({ userId: req.user._id }).lean();
    }

    if (!cart) {
      cart = { items: [], totalAmount: 0 };
    }

    res.locals.cart = cart; // để view nào cũng có cart
    next();
  } catch (err) {
    console.error("❌ Lỗi cartMiddleware:", err);
    res.locals.cart = { items: [], totalAmount: 0 };
    next();
  }
}

module.exports = cartMiddleware;

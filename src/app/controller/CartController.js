const { Cart, Product } = require("../models");

class CartController {
  // [GET] /cart
  async show(req, res) {
    try {
      const cart = await Cart.findOne({ userId: req.user._id })
        .populate("items.productId")
        .lean();
      if (!cart) {
        cart = { items: [], totalAmount: 0 };
      }
      res.render("pages/cart", {
        page: { title: "Giỏ hàng" },
        cart,
      });
    } catch (err) {
      console.error("Lỗi khi load giỏ hàng:", err);
      res.status(500).send("Server error");
    }
  }

  // [POST] /cart/add
  async addToCart(req, res) {
    try {
      const userId = req.user?._id; // lấy user từ middleware auth
      const { productId, quantity } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Bạn cần đăng nhập để thêm giỏ hàng",
        });
      }

      // kiểm tra sản phẩm
      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: "Sản phẩm không tồn tại hoặc đã ngừng bán",
        });
      }

      const qty = parseInt(quantity) || 1;
      if (qty < 1) {
        return res
          .status(400)
          .json({ success: false, message: "Số lượng không hợp lệ" });
      }

      // tìm giỏ hàng
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [], totalAmount: 0 });
      }

      // kiểm tra item đã có trong giỏ chưa
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += qty;
      } else {
        cart.items.push({
          productId: product._id,
          quantity: qty,
          price: product.salePrice || product.price,
          name: product.name,
          image: product.images[0] || "/img/no-image.png",
        });
      }

      // tính lại tổng tiền
      cart.totalAmount = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      await cart.save();

      return res.json({
        success: true,
        message: "Đã thêm sản phẩm vào giỏ hàng",
        cart,
      });
    } catch (err) {
      console.error("Lỗi thêm giỏ hàng:", err);
      res
        .status(500)
        .json({ success: false, message: "Lỗi server khi thêm giỏ hàng" });
    }
  }

  // [PUT] /cart/update
  async updateQuantity(req, res) {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user._id;

      let cart = await Cart.findOne({ userId });
      if (!cart) return res.status(404).json({ message: "Không có giỏ hàng" });

      const item = cart.items.find(
        (i) => String(i.productId) === String(productId)
      );
      if (!item)
        return res.status(404).json({ message: "Sản phẩm không có trong giỏ" });

      item.quantity = parseInt(quantity);

      cart.totalAmount = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      await cart.save();
      res.json({ message: "Cập nhật số lượng thành công", cart });
    } catch (err) {
      console.error("❌ Lỗi updateQuantity:", err);
      res.status(500).json({ message: "Lỗi server" });
    }
  }

  // [DELETE] /cart/remove
  async removeFromCart(req, res) {
    try {
      const { productId } = req.body;
      const userId = req.user._id;
      if (!userId) {
        return res.status(401).json({ message: "Bạn cần đăng nhập" });
      }
      let cart = await Cart.findOne({ userId });
      if (!cart) return res.status(404).json({ message: "Không có giỏ hàng" });

      cart.items = cart.items.filter(
        (i) => String(i.productId) !== String(productId)
      );

      cart.totalAmount = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      await cart.save();
      res.redirect("back")
    } catch (err) {
      console.error("❌ Lỗi removeFromCart:", err);
      res.status(500).json({ message: "Lỗi server" });
    }
  }

  // [DELETE] /cart/clear
  async clearCart(req, res) {
    try {
      const userId = req.user._id;

      let cart = await Cart.findOne({ userId });
      if (!cart) return res.status(404).json({ message: "Không có giỏ hàng" });

      cart.items = [];
      cart.totalAmount = 0;

      await cart.save();
      res.json({ message: "Đã xóa toàn bộ giỏ hàng", cart });
    } catch (err) {
      console.error("❌ Lỗi clearCart:", err);
      res.status(500).json({ message: "Lỗi server" });
    }
  }

  async checkout(req, res) {
    try {
      const userId = req.user?._id;
      const cart = await Cart.findOne({ userId }).lean();

      res.render("pages/checkout", {
        page: { title: "Thanh toán" },
        cart: cart || { items: [], totalAmount: 0 },
      });
    } catch (err) {
      console.error("❌ Checkout error:", err);
      res.redirect("/");
    }
  }
}

module.exports = new CartController();

const express = require("express");
const router = express.Router();
const { HomeController, UserController } = require("../app/controller/index");
const CheckPermission = require("../app/middlewares/CheckPermission");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer - lưu tạm file trước khi upload lên Cloudinary
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file ảnh!"));
    }
  },
});

// ================= Routes =================

// Public routes (không cần đăng nhập)
router.get("/", HomeController.dashboard);

// Trang chủ (yêu cầu đăng nhập)
router.get("/homepage", CheckPermission.verifyToken, HomeController.home);

// Public pages (attach user nếu có)
router.get("/products", CheckPermission.attachUser, HomeController.products);
router.get("/products/:slug", CheckPermission.attachUser, HomeController.productDetails);
router.get("/interior-design", CheckPermission.attachUser, HomeController.interiorDesign);
router.get("/contact", CheckPermission.attachUser, HomeController.contact);
router.get("/about", CheckPermission.attachUser, HomeController.about);
router.get("/news", CheckPermission.attachUser, HomeController.news);

// Auth pages (login, signup)
router.get("/login", CheckPermission.checkNotAuthenticated, HomeController.login);
router.post("/login", CheckPermission.checkNotAuthenticated, HomeController.login);
router.get("/signup", CheckPermission.checkNotAuthenticated, HomeController.signup);
router.post("/signup", CheckPermission.checkNotAuthenticated, HomeController.signup);

// User protected routes
router.use("/profile", CheckPermission.verifyToken, CheckPermission.checkUser);
router.use("/orders", CheckPermission.verifyToken, CheckPermission.checkUser);
router.use("/wishlist", CheckPermission.verifyToken, CheckPermission.checkUser);
router.use("/cart", CheckPermission.verifyToken, CheckPermission.checkUser);
router.use("/change-password", CheckPermission.verifyToken, CheckPermission.checkUser);

router.get("/profile", UserController.profile);
router.post("/profile/update", upload.single("avatar"), UserController.updateProfile);
router.get("/orders", UserController.orders);
router.get("/wishlist", UserController.wishlist);
router.get("/change-password", UserController.changePassword);
router.post("/change-password", UserController.handleChangePassword);

// Logout (chỉ khi đã login)
router.get("/logout", CheckPermission.verifyToken, HomeController.logout);

// API check username/email
router.get("/check-username", HomeController.checkUsername);
router.get("/check-email", HomeController.checkEmail);

module.exports = router;

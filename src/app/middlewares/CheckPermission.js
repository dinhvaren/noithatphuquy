const { User } = require("../models/index");
const jwt = require("jsonwebtoken");

class CheckPermission {
  // Gắn user vào req và res.locals (dùng cho view)
  async attachUser(req, res, next) {
    try {
      const token =
        req.cookies?.token || req.headers.authorization?.split(" ")[1];
      if (token) {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your-secret-key"
        );
        const user = await User.findById(decoded.id);
        if (user && user.isActive) {
          req.user = user;
          res.locals.user = user;
        } else {
          res.clearCookie("token");
        }
      }
      next();
    } catch (error) {
      res.clearCookie("token");
      next();
    }
  }

  // Yêu cầu phải đăng nhập
  async verifyToken(req, res, next) {
    try {
      // Cho phép qua với các route public
      if (
        ["/admin/login", "/login", "/register", "/logout"].includes(
          req.originalUrl
        )
      ) {
        return next();
      }

      const token =
        req.cookies?.token || req.headers.authorization?.split(" ")[1];

      if (!token) {
        if (req.session) req.session.returnTo = req.originalUrl;
        return res.redirect(
          req.originalUrl.startsWith("/admin") ? "/admin/login" : "/login"
        );
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        res.clearCookie("token");
        return res.redirect(
          req.originalUrl.startsWith("/admin") ? "/admin/login" : "/login"
        );
      }

      req.user = user;
      res.locals.user = user;
      next();
    } catch (error) {
      console.error("Auth error:", error);
      res.clearCookie("token");
      return res.redirect(
        req.originalUrl.startsWith("/admin") ? "/admin/login" : "/login"
      );
    }
  }

  // Chỉ admin mới vào được
  checkAdmin(req, res, next) {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).render("error/403", {
        layout: false,
        error: "Bạn không có quyền truy cập trang này",
      });
    }
    next();
  }

  // Chỉ user thường mới vào được
  checkUser(req, res, next) {
    if (!req.user || req.user.role !== "user") {
      return res.status(403).render("error/403", {
        layout: false,
        error: "Bạn không có quyền truy cập trang này",
      });
    }
    next();
  }

  // Nếu đã login thì không cho vào lại login/register
  async checkNotAuthenticated(req, res, next) {
    if (req.originalUrl !== "/admin/login" && req.originalUrl !== "/login") {
      return next();
    }

    try {
      const token = req.cookies?.token;
      if (!token) return next();

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );
      const user = await User.findById(decoded.id);

      if (user && user.isActive) {
        if (req.originalUrl === "/admin/login" && user.role === "admin") {
          return res.redirect("/admin");
        }
        if (req.originalUrl === "/login" && user.role === "user") {
          return res.redirect("/homepage");
        }
      }

      res.clearCookie("token");
      return next();
    } catch (error) {
      res.clearCookie("token");
      return next();
    }
  }
}

module.exports = new CheckPermission();

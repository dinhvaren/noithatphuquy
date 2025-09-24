const multer = require("multer");
require("dotenv").config();
// Import thư viện Express để tạo server
const express = require("express");
// Import thư viện Morgan để log HTTP request
const morgan = require("morgan");
// Import template engine Handlebars
const handlebars = require("express-handlebars");
// Cho phép gửi PUT, DELETE từ form HTML
const methodOverride = require("method-override");
// Import module Path để làm việc với đường dẫn
const path = require("path");
// Import cookie-parser để đọc cookies
const cookieParser = require("cookie-parser");
// Import express-session
const session = require("express-session");
// Khởi tạo ứng dụng Express
const app = express();
// Định nghĩa cổng chạy server
const port = process.env.PORT;
const host = process.env.HOST;
// Import file định tuyến
const route = require("./routes");
// Import cấu hình database
const db = require("./config/db/database");

// Kết nối đến cơ sở dữ liệu
db.connect();

// Cấu hình cookie-parser
app.use(cookieParser());

// Cấu hình session
// app.use(session({
//     secret: process.env.SESSION_SECRET || 'your-secret-key',
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         secure: process.env.NODE_ENV === 'production',
//         maxAge: 24 * 60 * 60 * 1000 // 24 giờ
//     }
// }));
const isProduction = process.env.NODE_ENV === "production";

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Cấu hình thư mục tĩnh (chứa CSS, JS, Images)
app.use(express.static(path.join(__dirname, "public")));
// Cấu hình thư mục uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Middleware để log HTTP request ra console
// app.use(morgan('combined'));
// Ghi đè phương thức HTTP (hỗ trợ PUT, DELETE trong form)
app.use(methodOverride("_method"));
// Middleware để xử lý dữ liệu JSON từ request
app.use(express.json());
// Middleware xử lý dữ liệu từ form (application/x-www-form-urlencoded)
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Cấu hình Template Engine Handlebars
app.engine(
  "hbs",
  handlebars.engine({
    extname: ".hbs", // Đổi phần mở rộng của template thành .hbs thay vì .handlebars
    helpers: {
      sum: (a, b) => a + b,
      isEqual: (a, b) => String(a) === String(b),
      eq: (a, b) => a === b,
      calculateDiscountPercentage: (originalPrice, salePrice) => {
        if (!originalPrice || !salePrice || originalPrice <= 0) return 0;
        const discount = ((originalPrice - salePrice) / originalPrice) * 100;
        return Math.round(discount);
      },
      not: (value) => !value,
      formatCurrency: (value) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(value),
      lookup: (obj, field) => obj[field],
      section: function (name, options) {
        if (!this._sections) this._sections = {};
        this._sections[name] = options.fn(this);
        return null;
      },
      isChecked: (selected, id) => {
        if (!selected) return false;
        if (Array.isArray(selected)) {
          return selected.map(String).includes(String(id));
        }
        return String(selected) === String(id);
      },

      // === Thêm mới ===
      range: (from, to, options) => {
        let out = "";
        for (let i = from; i <= to; i++) {
          out += options.fn(i);
        }
        return out;
      },
      ifCond: (v1, operator, v2, options) => {
        switch (operator) {
          case "<=":
            return v1 <= v2 ? options.fn(this) : options.inverse(this);
          case ">=":
            return v1 >= v2 ? options.fn(this) : options.inverse(this);
          case "==":
            return v1 == v2 ? options.fn(this) : options.inverse(this);
          case "===":
            return v1 === v2 ? options.fn(this) : options.inverse(this);
          default:
            return options.inverse(this);
        }
      },
    },
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
    },
    partialsDir: [
      path.join(__dirname, "resources/views/modals"),
      path.join(__dirname, "resources/views/partials"),
      path.join(__dirname, "resources/views/sections"),
      path.join(__dirname, "resources/views/admin"),
      path.join(__dirname, "resources/views/pages"),
    ],
  })
);

// Thiết lập Handlebars làm view engine
app.set("view engine", "hbs");
// Cấu hình thư mục chứa views
app.set("views", path.join(__dirname, "resources", "views"));
// rất quan trọng khi deploy
app.set("trust proxy", 1);

// Khởi tạo routes cho ứng dụng
route(app);

// Lắng nghe kết nối tại cổng được chỉ định
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

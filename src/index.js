// Import thư viện Express để tạo server
const express = require('express');
// Import thư viện Morgan để log HTTP request
const morgan = require('morgan');
// Import template engine Handlebars
const handlebars = require('express-handlebars');
// Cho phép gửi PUT, DELETE từ form HTML
const methodOverride = require('method-override');
// Import module Path để làm việc với đường dẫn
const path = require('path');
// Khởi tạo ứng dụng Express
const app = express();
// Định nghĩa cổng chạy server
const port = 3000;
// Import file định tuyến
const route = require('./routes');
// Import cấu hình database
const db = require('./config/db/database');

// Kết nối đến cơ sở dữ liệu
db.connect();

// Middleware để xử lý dữ liệu JSON từ request
app.use(express.json());
// Cấu hình thư mục tĩnh (chứa CSS, JS, Images)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware để log HTTP request ra console
app.use(morgan('combined'));

// Ghi đè phương thức HTTP (hỗ trợ PUT, DELETE trong form)
app.use(methodOverride('_method'));

// Middleware xử lý dữ liệu từ form (application/x-www-form-urlencoded)
app.use(
    express.urlencoded({
        extended: true,
    }),
);

// Cấu hình Template Engine Handlebars
app.engine(
    'hbs',
    handlebars.engine({
        extname: '.hbs', // Đổi phần mở rộng của template thành .hbs thay vì .handlebars
        helpers: {
            sum: (a, b) => a + b, // Định nghĩa helper "sum" để cộng hai số trong template
        },
        partialsDir: [
            path.join(__dirname, 'resources/views/modals'),
            path.join(__dirname, 'resources/views/partials')
        ]
    }),
);

// Thiết lập Handlebars làm view engine
app.set('view engine', 'hbs');
// Cấu hình thư mục chứa views
app.set('views', path.join(__dirname, 'resources', 'views'));

// Khởi tạo routes cho ứng dụng
route(app);

// Lắng nghe kết nối tại cổng được chỉ định
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

const { Product, Category } = require("../models/index");
const cloudinaryService = require("../services/cloudinaryService");
const slugify = require("slugify");

function unflatten(obj) {
  const result = {};
  for (const key in obj) {
    key.split(".").reduce((acc, part, idx, arr) => {
      return (
        acc[part] ||
        (acc[part] = isNaN(arr[idx + 1])
          ? arr.length - 1 === idx
            ? obj[key]
            : {}
          : [])
      );
    }, result);
  }
  return result;
}
class ProductController {
  // Modal thêm sản phẩm mới
  async createProductModal(req, res, next) {
    try {
      if (req.method === "GET") {
        // Nếu là GET request, hiển thị trang thêm sản phẩm
        const categories = await Category.find().lean();
        return res.render("admin/AddProduct", {
          page: { title: "Thêm sản phẩm mới" },
          categories,
          user: req.user,
        });
      }

      // Nếu là POST request, xử lý thêm sản phẩm
      const {
        name,
        price,
        salePrice,
        category,
        description,
        isActive,
        specifications,
      } = req.body;

      console.log("=== BẮT ĐẦU TẠO SẢN PHẨM MỚI ===");
      console.log("Dữ liệu nhận được:", req.body);
      console.log("Files:", req.files);

      // Kiểm tra dữ liệu bắt buộc
      if (!name || !price || !category || !description) {
        return res
          .status(400)
          .json({ message: "Vui lòng nhập đầy đủ thông tin" });
      }

      // Xử lý upload ảnh lên Cloudinary
      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        console.log(`Bắt đầu upload ${req.files.length} ảnh lên Cloudinary`);

        // Upload từng ảnh lên Cloudinary
        const uploadPromises = req.files.map((file) => {
          return new Promise((resolve, reject) => {
            cloudinaryService
              .uploadImage(file.path)
              .then((result) => {
                console.log("Upload ảnh thành công:", result.secure_url);
                resolve(result.secure_url);
              })
              .catch((error) => {
                console.error("Lỗi upload ảnh:", error);
                reject(error);
              });
          });
        });

        // Đợi tất cả các ảnh được upload
        imageUrls = await Promise.all(uploadPromises);
        console.log("Tất cả ảnh đã được upload:", imageUrls);
      }

      // Tạo mã sản phẩm tự động
      const code = "SP" + Date.now().toString().slice(-6);

      const body = unflatten(req.body);

      // Tạo object specifications
      const productSpecifications = {
        material: body.material || "",
        color: body.color || "",
        size: {
          length: parseFloat(body.specifications?.size?.length) || null,
          width: parseFloat(body.specifications?.size?.width) || null,
          height: parseFloat(body.specifications?.size?.height) || null,
        },
        warranty: parseFloat(body.specifications?.warranty) || null,
      };

      console.log("Thông số sản phẩm:", productSpecifications);

      // Tạo slug từ tên sản phẩm
      const slug = slugify(name, {
        lower: true,
        strict: true,
        locale: "vi",
      });

      // Tạo sản phẩm mới
      const product = new Product({
        name,
        code,
        slug,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        categoryId: category,
        description,
        images: imageUrls,
        isActive: isActive === "true",
        specifications: productSpecifications,
      });

      console.log("Sản phẩm sẽ được tạo:", product);

      // Lưu sản phẩm
      const savedProduct = await product.save();
      console.log("=== TẠO SẢN PHẨM THÀNH CÔNG ===");

      // Chuyển hướng về trang danh sách sản phẩm
      return res.redirect("/admin");
    } catch (error) {
      console.error("=== LỖI KHI TẠO SẢN PHẨM ===", error);
      // Nếu có lỗi validation, trả về thông báo lỗi chi tiết
      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: "Dữ liệu không hợp lệ",
          errors: Object.values(error.errors).map((err) => err.message),
        });
      }
      return res
        .status(500)
        .json({ message: "Lỗi server, vui lòng thử lại sau" });
    }
  }

  // Modal chỉnh sửa sản phẩm
  async editProductModal(req, res, next) {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId)
        .populate("categoryId")
        .lean();

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy sản phẩm" });
      }

      res.json({
        success: true,
        data: {
          ...product,
          categoryId: product.categoryId?._id, // gửi _id về client
          categoryName: product.categoryId?.name, // nếu muốn hiển thị tên
        },
      });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin sản phẩm:", error);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  }

  // Cập nhật sản phẩm
  async updateProductModal(req, res, next) {
    try {
      console.log("=== BẮT ĐẦU CẬP NHẬT SẢN PHẨM ===");
      const productId = req.params.id;

      // Kiểm tra sản phẩm tồn tại
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      }

      // Chuẩn hoá body (unflatten để có nested object)
      const body = unflatten(req.body);

      const {
        name,
        price,
        salePrice,
        category,
        description,
        isActive,
        material,
        color,
        specifications,
        existingImages,
      } = body;

      console.log("Body sau khi unflatten:", body);
      console.log("Files:", req.files);

      // Kiểm tra dữ liệu bắt buộc
      if (!name || !price || !category || !description) {
        return res
          .status(400)
          .json({ message: "Vui lòng nhập đầy đủ thông tin" });
      }

      // Xử lý ảnh hiện có (nếu có)
      let imageUrls = [];
      if (existingImages) {
        if (Array.isArray(existingImages)) {
          imageUrls = existingImages;
        } else if (typeof existingImages === "string") {
          imageUrls = [existingImages];
        }
      }

      // Upload ảnh mới lên Cloudinary (nếu có)
      if (req.files && req.files.length > 0) {
        console.log(
          `Bắt đầu upload ${req.files.length} ảnh mới lên Cloudinary`
        );
        const uploadPromises = req.files.map((file) =>
          cloudinaryService.uploadImage(file.path).then((result) => {
            console.log("Upload ảnh thành công:", result.secure_url);
            return result.secure_url;
          })
        );
        const newImageUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...newImageUrls];
        console.log("Tất cả ảnh mới đã được upload:", newImageUrls);
      }

      // Xử lý specifications (lúc này specifications đã là object lồng)
      const productSpecifications = {
        material: material || "",
        color: color || "",
        size: {
          length: parseFloat(specifications?.size?.length) || null,
          width: parseFloat(specifications?.size?.width) || null,
          height: parseFloat(specifications?.size?.height) || null,
        },
        warranty: parseFloat(specifications?.warranty) || null,
      };

      console.log("Thông số sản phẩm:", productSpecifications);

      // Dữ liệu cập nhật
      const updateData = {
        name,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : undefined,
        categoryId: category,
        description,
        isActive: isActive === "true" || isActive === true,
        specifications: productSpecifications,
      };

      if (imageUrls.length > 0) {
        updateData.images = imageUrls;
      }

      console.log("Dữ liệu cập nhật:", updateData);

      // Lưu sản phẩm đã cập nhật
      await Product.findByIdAndUpdate(productId, updateData, {
        new: true,
        runValidators: true,
      });

      console.log("=== CẬP NHẬT SẢN PHẨM THÀNH CÔNG ===");
      return res.redirect("/admin");
    } catch (error) {
      console.error("=== LỖI KHI CẬP NHẬT SẢN PHẨM ===", error);
      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: "Dữ liệu không hợp lệ",
          errors: Object.values(error.errors).map((err) => err.message),
        });
      }
      return res
        .status(500)
        .json({ message: "Lỗi server, vui lòng thử lại sau" });
    }
  }

  // Xem chi tiết sản phẩm
  viewProductModal(req, res, next) {
    const productId = req.params.id;
    res.render("modals/viewProduct", { layout: false, productId });
  }

  // Xóa sản phẩm
  async deleteProductModal(req, res, next) {
    try {
      console.log("=== BẮT ĐẦU XÓA SẢN PHẨM ===");
      const productId = req.params.id;

      // Tìm sản phẩm để lấy thông tin ảnh
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      }

      console.log("Thông tin sản phẩm sẽ xóa:", product);

      // Xóa ảnh trên Cloudinary
      if (product.images && product.images.length > 0) {
        for (const imageUrl of product.images) {
          try {
            // Lấy public_id từ URL
            const publicId = imageUrl.split("/").slice(-1)[0].split(".")[0];
            await cloudinaryService.deleteImage(publicId);
            console.log("Đã xóa ảnh:", publicId);
          } catch (error) {
            console.error("Lỗi khi xóa ảnh:", error);
          }
        }
      }

      // Xóa sản phẩm khỏi database
      await Product.findByIdAndDelete(productId);
      console.log("=== XÓA SẢN PHẨM THÀNH CÔNG ===");

      // Redirect về trang admin
      res.redirect("/admin");
    } catch (error) {
      console.error("=== LỖI KHI XÓA SẢN PHẨM ===", error);
      next(error);
    }
  }
}

module.exports = new ProductController();

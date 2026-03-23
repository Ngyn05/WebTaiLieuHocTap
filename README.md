# TMDT - E-Commerce Website with Supabase Integration

Dự án e-commerce đầy đủ chức năng tích hợp với **Supabase** - một nền tảng backend-as-a-service (BaaS) dựa trên PostgreSQL.

## 📋 Mục Lục

1. [Tính Năng](#tính-năng)
2. [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
3. [Cài Đặt](#cài-đặt)
4. [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
5. [Các Hàm API](#các-hàm-api)
6. [Cách Sử Dụng](#cách-sử-dụng)
7. [Các Trang Web](#các-trang-web)
8. [Troubleshooting](#troubleshooting)

## ✨ Tính Năng

### 🛍️ Chức Năng Mua Sắm
- ✅ Duyệt sản phẩm theo danh mục (8 danh mục)
- ✅ Tìm kiếm sản phẩm
- ✅ Xem chi tiết sản phẩm
- ✅ Thêm sản phẩm vào giỏ hàng
- ✅ Quản lý giỏ hàng (cập nhật số lượng, xóa sản phẩm)
- ✅ Xem tổng tiền

### 👤 Quản Lý Tài Khoản
- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập/Đăng xuất
- ✅ Quên mật khẩu
- ✅ Xem hồ sơ cá nhân
- ✅ Phân quyền role user/admin
- ✅ Trang quản trị riêng cho admin (quản lý user, sản phẩm, thống kê)

### 📦 Quản Lý Đơn Hàng
- ✅ Tạo đơn hàng từ giỏ hàng
- ✅ Xem lịch sử đơn hàng
- ✅ Xem chi tiết đơn hàng
- ✅ Cập nhật trạng thái đơn hàng
- ✅ Hủy đơn hàng

### 🛡️ Quản Trị Viên
- ✅ Admin đăng nhập sẽ tự chuyển sang trang admin
- ✅ Admin có thể xem danh sách user và quản lý sản phẩm
- ✅ Tài khoản admin chỉ tạo thủ công trong Supabase (không đăng ký từ giao diện người dùng)

### 💾 Lưu Trữ Dữ Liệu
- ✅ Tất cả dữ liệu lưu trên **Supabase PostgreSQL**
- ✅ Đồng bộ giỏ hàng (local + cloud)
- ✅ Bảo mật Row Level Security (RLS)

## 🖥️ Yêu Cầu Hệ Thống

- **Modern Web Browser** (Chrome, Firefox, Safari, Edge)
- **Internet Connection** (để kết nối Supabase)
- **Text Editor** (VS Code, Sublime, etc.)
- **Supabase Account** (miễn phí)

## 📦 Cài Đặt

### Bước 1: Sao chép/Tải Dự Án
```bash
# Hoặc tải file ZIP và giải nén
cd TMDT-main
```

### Bước 2: Tạo Supabase Project
1. Truy cập [supabase.com](https://supabase.com)
2. Đăng ký tài khoản miễn phí
3. Tạo project mới
4. Sao chép **Project URL** và **Anon Key**

### Bước 3: Cấu Hình Ứng Dụng
1. Mở file `supabase-config.js`
2. Thay thế:
   ```javascript
   const SUPABASE_URL = 'YOUR_PROJECT_URL';
   const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
   ```

### Bước 4: Tạo Database Schema
1. Mở **Supabase Dashboard > SQL Editor**
2. Nhấp **New Query**
3. Copy nội dung từ file `DATABASE_SCHEMA.sql`
4. Nhấp **Run**

### Bước 5: Chạy Ứng Dụng
1. Mở file `index.html` trong trình duyệt
2. Hoặc sử dụng Live Server (VS Code)

**📖 Xem chi tiết tại [SETUP_GUIDE.md](SETUP_GUIDE.md)**

## 📁 Cấu Trúc Dự Án

```
TMDT-main/
├── index.html                 # Trang chủ
├── shop.html                  # Trang danh sách sản phẩm
├── sproduct.html              # Trang chi tiết sản phẩm
├── cart.html                  # Trang giỏ hàng
├── payment.html               # Trang thanh toán
├── orders.html                # Trang đơn hàng
├── login.html                 # Trang đăng nhập
├── register.html              # Trang đăng ký
├── admin.html                 # Trang quản trị admin
├── blog.html                  # Trang blog
├── about.html                 # Trang giới thiệu
├── contact.html               # Trang liên hệ
│
├── script.js                  # Script chính (navbar, init)
├── shop.js                    # Script cho trang shop
├── cart.js                    # Script cho trang giỏ hàng
├── sproduct.js                # Script cho trang chi tiết sản phẩm
│
├── supabase-config.js         # ⭐ Cấu hình Supabase
├── auth.js                    # ⭐ Hàm authentication
├── admin.js                   # ⭐ Logic quản trị admin
├── products-db.js             # ⭐ Hàm quản lý sản phẩm
├── cart-db.js                 # ⭐ Hàm quản lý giỏ hàng
├── orders-db.js               # ⭐ Hàm quản lý đơn hàng
│
├── style.css                  # Stylesheet
│
├── DATABASE_SCHEMA.sql        # 📋 Schema SQL
├── SETUP_GUIDE.md             # 📖 Hướng dẫn cài đặt
├── README.md                  # 📄 File này
│
└── img/                       # Thư mục hình ảnh
    ├── products/
    ├── category/
    ├── banner/
    └── ...
```

### 📝 Các File Quan Trọng (Với Supabase)

| File | Mô Tả |
|------|-------|
| `supabase-config.js` | Khởi tạo Supabase client |
| `auth.js` | Đăng ký, đăng nhập, quên mật khẩu |
| `products-db.js` | Lấy & tìm kiếm sản phẩm từ DB |
| `cart-db.js` | Quản lý giỏ hàng (local + cloud) |
| `orders-db.js` | Tạo & xem đơn hàng |

## 🔌 Các Hàm API

### Authentication (`auth.js`)

```javascript
// Đăng ký
const result = await registerUser(username, email, password);

// Đăng nhập
const result = await loginUser(email, password);

// Đăng xuất
const result = await logoutUser();

// Lấy user hiện tại
const user = await getCurrentUser();

// Kiểm tra đăng nhập
const isLoggedIn = await isUserLoggedIn();

// Quên mật khẩu
const result = await resetPassword(email);
```

### Products (`products-db.js`)

```javascript
// Lấy tất cả sản phẩm
const success = await loadProducts();

// Lấy sản phẩm theo danh mục
const products = await getProductsByCategory('cg1');

// Lấy chi tiết sản phẩm
const product = await getProductById('cg1-1');

// Tìm kiếm sản phẩm
const products = await searchProducts('iPhone');

// Lấy danh sách danh mục
const categories = await getCategories();
```

### Cart (`cart-db.js`)

```javascript
// Thêm vào giỏ hàng
const result = await addToCart(userId, product, quantity);

// Lấy giỏ hàng từ DB
const cart = await getCartFromDatabase(userId);

// Cập nhật số lượng
const result = await updateCartQuantity(cartItemId, quantity);

// Xóa khỏi giỏ hàng
const result = await removeFromCart(productId);

// Xoá toàn bộ giỏ
const result = await clearCart(userId);

// Đồng bộ giỏ (local ↔ cloud)
const result = await syncCartWithDatabase(userId);
```

### Orders (`orders-db.js`)

```javascript
// Tạo đơn hàng
const result = await createOrder(userId, orderData);

// Lấy đơn hàng của user
const orders = await getUserOrders(userId);

// Chi tiết đơn hàng
const order = await getOrderDetails(orderId);

// Cập nhật trạng thái
const result = await updateOrderStatus(orderId, 'shipped');

// Hủy đơn hàng
const result = await cancelOrder(orderId);

// Lấy tất cả đơn hàng (admin)
const orders = await getAllOrders();
```

## 🎯 Cách Sử Dụng

### 1️⃣ Duyệt Sản Phẩm

```html
<!-- Trang chủ: Xem sản phẩm nổi bật -->
index.html

<!-- Trang cửa hàng: Lọc theo danh mục -->
shop.html?category=cg1  <!-- Điện thoại, Tablet -->
shop.html?category=cg2  <!-- Laptop -->
shop.html?category=cg3  <!-- Âm thanh -->
```

### 2️⃣ Thêm Vào Giỏ Hàng

```javascript
// Khi user click "Thêm vào giỏ hàng"
const product = productsData.find(p => p.id === 'cg1-1');
const userId = localStorage.getItem('user_id');
await addToCart(userId, product, 1);
```

### 3️⃣ Đặt Hàng

```javascript
// Tại trang thanh toán (payment.html)
const orderData = {
    fullName: "Nguyễn Văn A",
    email: "user@example.com",
    address: "123 Đường ABC",
    city: "HCM",
    postalCode: "700000",
    country: "Vietnam",
    totalAmount: 156.00,
    paymentMethod: "credit_card"
};

const result = await createOrder(userId, orderData);
```

### 4️⃣ Xem Lịch Sử Đơn Hàng

```javascript
// Tại trang đơn hàng (orders.html)
const orders = await getUserOrders(userId);
orders.forEach(order => {
    console.log(`#${order.order_number}: ${order.total_amount}$`);
});
```

## 🌐 Các Trang Web

| Trang | URL | Mô Tả |
|-------|-----|-------|
| 🏠 Trang Chủ | `index.html` | Sản phẩm nổi bật, danh mục |
| 🛍️ Cửa Hàng | `shop.html` | Danh sách sản phẩm, lọc theo danh mục |
| 📦 Chi Tiết | `sproduct.html?id=cg1-1` | Thông tin sản phẩm chi tiết |
| 🛒 Giỏ Hàng | `cart.html` | Quản lý sản phẩm, tính tổng |
| 💳 Thanh Toán | `payment.html` | Điền thông tin giao hàng |
| 📋 Đơn Hàng | `orders.html` | Xem lịch sử đơn hàng |
| 📝 Blog | `blog.html` | Bài viết tin tức |
| ℹ️ Giới Thiệu | `about.html` | Thông tin cửa hàng |
| 📞 Liên Hệ | `contact.html` | Form liên hệ |
| 🔐 Đăng Nhập | `login.html` | Đăng nhập tài khoản |
| ✍️ Đăng Ký | `register.html` | Tạo tài khoản mới |

## 🆘 Troubleshooting

### ❌ Lỗi: "Supabase client not initialized"

**Nguyên nhân:** URL hoặc KEY không đúng

**Giải pháp:**
1. Kiểm tra `supabase-config.js`
2. Xác nhận URL và KEY từ Supabase Dashboard
3. Đảm bảo không có space thừa

```javascript
// ❌ Sai
const SUPABASE_URL = ' https://... ';

// ✅ Đúng
const SUPABASE_URL = 'https://...';
```

### ❌ Lỗi: "Row Level Security Policy"

**Nguyên nhân:** RLS không cho phép query

**Giải pháp:**
1. Vào **Supabase > Table Editor > [Table] > Policies**
2. Kiểm tra RLS policies
3. Chạy lại `DATABASE_SCHEMA.sql` để cập nhật policies

### ❌ Không thể đăng nhập

**Nguyên nhân:** 
- Email chưa xác nhận
- Mật khẩu sai
- User chưa được tạo

**Giải pháp:**
1. Kiểm tra email inbox + Spam folder
2. Tại `Auth > Users` trong Supabase, xác nhận user có được tạo không
3. Đặt lại mật khẩu qua "Quên mật khẩu"

### ❌ Sản phẩm không hiển thị

**Nguyên nhân:**
- Bảng `products` trống
- RLS policy ngăn chặn
- Lỗi khi lấy dữ liệu

**Giải pháp:**
1. Kiểm tra `products` table có dữ liệu:
   ```javascript
   const { data, error } = await supabaseClient
     .from('products')
     .select('*');
   console.log(data, error);
   ```
2. Bật RLS policy cho SELECT công khai
3. Kiểm tra Console (F12) xem lỗi chi tiết

### ❌ Giỏ hàng không đồng bộ

**Nguyên nhân:** User chưa đăng nhập

**Giải pháp:**
1. Giỏ hàng lưu ở localStorage khi offline
2. Khi user đăng nhập, gọi `syncCartWithDatabase(userId)`
3. Dữ liệu sẽ đồng bộ lên Supabase

## 🚀 Tính Năng Tiếp Theo

- ⭐ Hệ thống đánh giá sản phẩm
- ❤️ Danh sách yêu thích
- 🔍 Tìm kiếm nâng cao
- 💳 Thanh toán trực tuyến (Stripe/PayPal)
- 📧 Thông báo email
- 🎁 Mã giảm giá & Khuyến mãi
- 📊 Dashboard admin
- 📱 Ứng dụng di động

## 📚 Tài Liệu Thêm

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Supabase Discord Community](https://discord.supabase.io)
- [Supabase GitHub Issues](https://github.com/supabase/supabase/issues)

## 📄 Giấy Phép

Dự án này mở cho mục đích học tập và phát triển. Sử dụng tự do cho dự án cá nhân.

## 👨‍💻 Tác Giả

Tạo với ❤️ cho cộng đồng developer Việt Nam

---

**Happy Coding! 🎉**

Nếu có câu hỏi, vui lòng mở issue hoặc liên hệ support.

# WebTaiLieuHocTap

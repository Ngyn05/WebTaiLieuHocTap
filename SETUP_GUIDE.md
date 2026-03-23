# HƯỚNG DẪN CÀI ĐẶT SUPABASE CHO DỰ ÁN TMDT

## 1. Chuẩn Bị

### Bước 1: Tạo tài khoản Supabase
1. Truy cập [https://supabase.com](https://supabase.com)
2. Nhấp "Sign Up" (Đăng ký)
3. Đăng ký bằng GitHub hoặc Email
4. Xác thực email của bạn

### Bước 2: Tạo Project Mới
1. Sau khi đăng nhập, nhấp "New Project" (Dự án mới)
2. Chọn Organization
3. Nhập tên project: `tmdt-ecommerce` (hoặc tên khác tùy bạn)
4. Đặt mật khẩu Database
5. Chọn Region gần nhất (ví dụ: Singapore, Tokyo)
6. Nhấp "Create new project"

### Bước 3: Sao chép API Keys
1. Khi project được tạo, vào mục **Settings > API**
2. Tìm các trường:
   - **Project URL** (Supabase URL)
   - **anon public** (ANON KEY)
3. Copy hai giá trị này

## 2. Cấu Hình Ứng Dụng

### Cập Nhật `supabase-config.js`

Mở file `supabase-config.js` và thay thế:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

Với các giá trị thực tế từ Supabase:

```javascript
const SUPABASE_URL = 'https://abcdefgh1234567.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## 3. Tạo Database Schema

### Bước 1: Mở SQL Editor
1. Trong Supabase Dashboard, vào **SQL Editor**
2. Chọn **New Query**

### Bước 2: Copy & Paste Database Schema
1. Mở file `DATABASE_SCHEMA.sql` trong project
2. Copy toàn bộ nội dung
3. Paste vào SQL Editor của Supabase
4. Nhấp **Run** để tạo tất cả các table và policies

### Bước 3: Xác Nhận Kết Quả
- Vào mục **Table Editor** trong Supabase
- Bạn sẽ thấy các table:
  - `profiles` - Thông tin người dùng
  - `products` - Sản phẩm
  - `cart_items` - Giỏ hàng
  - `orders` - Đơn hàng
  - `order_items` - Chi tiết đơn hàng
  - `favorites` - Danh sách yêu thích
  - `reviews` - Đánh giá

## 4. Bổ Sung Dữ Liệu Sản Phẩm

### Cách 1: Sử dụng SQL
1. Vào **SQL Editor** > **New Query**
2. Copy dữ liệu sản phẩm từ `DATABASE_SCHEMA.sql` (phần INSERT)
3. Chạy query để thêm sản phẩm mẫu

### Cách 2: Sử dụng Table Editor
1. Vào **Table Editor** > **products**
2. Nhấp **Insert row**
3. Nhập thông tin sản phẩm:
   - `id`: cg1-1, cg1-2, ... (hoặc UUID)
   - `name`: Tên sản phẩm
   - `category`: cg1, cg2, cg3, ...
   - `price`: Giá (số thập phân)
   - `image`: Đường dẫn hình ảnh
   - `description`: Mô tả sản phẩm

## 5. Cấu Hình Authentication

### Bước 1: Kích Hoạt Email Authentication
1. Vào **Settings > Authentication**
2. Tìm "Email authentication"
3. Bật "Confirm email"

### Bước 2: Cấu Hình Email Templates (Tùy chọn)
1. Vào **Settings > Email**
2. Tùy chỉnh các template email nếu cần

## 6. Cấu Hình RLS (Row Level Security)

**Lưu ý:** Nếu bạn sử dụng `DATABASE_SCHEMA.sql`, RLS đã được thiết lập sẵn.

### Xác Nhận RLS Settings:
1. Vào **Settings > Authentication**
2. Đảm bảo "Enable RLS" được bật cho các table
3. Xem RLS policies ở **Table Editor** > (chọn table) > **Policies**

## 7. Kiểm Tra Cấu Hình

### Mở ứng dụng trong trình duyệt:
1. Chạy file `index.html`
2. Kiểm tra Console (F12) xem có thông báo lỗi không
3. Bạn sẽ thấy: `"Supabase client initialized"`

### Kiểm tra từng chức năng:
- **Đăng ký**: Truy cập `register.html`
- **Đăng nhập**: Truy cập `login.html`
- **Xem sản phẩm**: Vào `shop.html` hoặc `index.html`
- **Thêm vào giỏ hàng**: Nhấp vào icon giỏ hàng trên sản phẩm
- **Xem đơn hàng**: Đăng nhập rồi vào `orders.html`

## 8. Các API Functions Có Sẵn

### Authentication (`auth.js`)
```javascript
registerUser(username, email, password)
loginUser(email, password)
logoutUser()
getCurrentUser()
isUserLoggedIn()
resetPassword(email)
```

### Products (`products-db.js`)
```javascript
loadProducts()
getProductsByCategory(category)
getProductById(productId)
searchProducts(searchTerm)
```

### Cart (`cart-db.js`)
```javascript
addToCart(userId, product, quantity)
getCartFromDatabase(userId)
updateCartQuantity(cartItemId, quantity)
removeFromCart(productId)
clearCart(userId)
syncCartWithDatabase(userId)
```

### Orders (`orders-db.js`)
```javascript
createOrder(userId, orderData)
getUserOrders(userId)
getOrderDetails(orderId)
updateOrderStatus(orderId, status)
cancelOrder(orderId)
getAllOrders()
```

## 9. Troubleshooting

### Lỗi: "Supabase client not initialized"
- **Giải pháp**: Kiểm tra `supabase-config.js` có URL và KEY đúng không

### Lỗi: "Row Level Security Policy"
- **Giải pháp**: Đảm bảo user đã đăng nhập hoặc RLS policy cho phép public access

### Không thể đăng nhập
- **Giải pháp**: 
  - Kiểm tra email đã xác nhận chưa (check email)
  - Xem lại password
  - Vào `Auth > Users` trong Supabase để kiểm tra user đã được tạo chưa

### Sản phẩm không hiển thị
- **Giải pháp**:
  - Kiểm tra bảng `products` có dữ liệu không (Table Editor)
  - Bật RLS policy cho phép public SELECT trên `products`
  - Kiểm tra Console (F12) xem có lỗi gì không

## 10. Các Tính Năng Tiếp Theo (Optional)

### Thêm hệ thống đánh giá
```javascript
// functions/reviews.js
async function addReview(userId, productId, rating, comment)
async function getProductReviews(productId)
```

### Thêm danh sách yêu thích
```javascript
// functions/favorites.js
async function addToFavorites(userId, productId)
async function removeFromFavorites(userId, productId)
async function getUserFavorites(userId)
```

### Thanh toán trực tuyến
- Tích hợp Stripe hoặc PayPal
- Lưu thông tin thanh toán một cách an toàn

### Email Notifications
- Gửi email xác nhận đơn hàng
- Thông báo cập nhật đơn hàng
- Email quên mật khẩu

## 11. Bảo Mật

### Điều Quan Trọng:
1. **Không bao giờ** chia sẻ ANON_KEY hoặc DATABASE_PASSWORD công khai
2. Luôn sử dụng RLS policies
3. Kiểm tra authentication trước mỗi hành động nhạy cảm
4. Sử dụng HTTPS cho production

### Best Practices:
- Sử dụng environment variables cho credentials
- Implement server-side validation
- Rate limiting cho các API
- Audit logs cho các thay đổi quan trọng

## 12. Hỗ Trợ

- Tài liệu Supabase: https://supabase.com/docs
- Community: https://discord.supabase.io
- Issues: https://github.com/supabase/supabase/issues

---

**Chúc mừng bạn đã thiết lập Supabase thành công! 🎉**

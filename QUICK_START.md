# QUICK START GUIDE - Bắt Đầu Nhanh

## ⚡ Chỉ 5 Phút để Chạy Ứng Dụng

### 1️⃣ Tạo Supabase Project (2 phút)

```
1. Vào https://supabase.com
2. Sign Up (đăng ký miễn phí)
3. New Project
4. Chọn organization & region
5. Create
```

**Sao chép 2 thứ:**
- Project URL: `https://xxxxx.supabase.co`
- Anon Key: `eyJhbGc...`

### 2️⃣ Cấu Hình Ứng Dụng (1 phút)

Mở file `supabase-config.js`:

```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co';      // ← Paste URL
const SUPABASE_ANON_KEY = 'eyJhbGc...';                // ← Paste Key
```

**Lưu file (Ctrl+S)**

### 3️⃣ Tạo Database (1 phút)

Supabase Dashboard:
1. SQL Editor
2. New Query
3. Copy từ `DATABASE_SCHEMA.sql`
4. Run

✅ Done! Database tạo xong.

### 4️⃣ Chạy Ứng Dụng (1 phút)

**Cách 1: Mở file**
```
Nhấp đôi vào index.html
```

**Cách 2: Dùng Live Server (VS Code)**
```
1. Cài extension "Live Server"
2. Chuột phải > Open with Live Server
3. Trang sẽ mở tự động
```

## 🧪 Kiểm Tra Nhanh

### ✅ Console Check
```
F12 → Console → Xem có "Supabase client initialized" không
```

### ✅ Đăng ký Test
```
1. Vào register.html
2. Tạo tài khoản:
   - Username: test123
   - Email: test@example.com
   - Password: password123
3. Bấm Đăng ký
```

### ✅ Đăng nhập Test
```
1. Vào login.html
2. Nhập email & password từ lúc đăng ký
3. Bấm Đăng nhập
4. Sẽ redirect sang index.html
```

### ✅ Thêm Sản Phẩm Vào Giỏ
```
1. Vào shop.html
2. Nhấp vào sản phẩm
3. Nhấp "Thêm vào giỏ hàng"
4. Xem giỏ hàng (icon bag)
```

## 📋 Danh Mục Sản Phẩm

```
cg1 - Điện thoại, Tablet
cg2 - Laptop
cg3 - Âm thanh (Tai nghe)
cg4 - Đồng hồ, Camera
cg5 - Đồ gia dụng
cg6 - Phụ kiện
cg7 - PC, Màn hình, Máy in
cg8 - Tivi
```

## 🐛 Lỗi Phổ Biến & Cách Sửa

| Lỗi | Sửa |
|-----|-----|
| Supabase client not initialized | Kiểm tra URL & KEY ở supabase-config.js |
| Không đăng ký được | Kiểm tra email format, password ≥ 6 ký tự |
| Sản phẩm không hiển thị | Chạy DATABASE_SCHEMA.sql để thêm sản phẩm |
| Giỏ hàng trống khi refresh | Bình thường, dữ liệu lưu ở localStorage |
| Không vào được orders.html | Phải đăng nhập trước |

## 🔑 Important Files

| File | Chức Năng |
|------|----------|
| `supabase-config.js` | ⚙️ Cấu hình (PHẢI CHỈNH) |
| `DATABASE_SCHEMA.sql` | 📋 Tạo database |
| `auth.js` | 🔐 Đăng nhập/Đăng ký |
| `products-db.js` | 🛍️ Sản phẩm |
| `cart-db.js` | 🛒 Giỏ hàng |
| `orders-db.js` | 📦 Đơn hàng |

## 💡 Tips

1. **Giỏ hàng không mất:** Dữ liệu lưu cả ở localStorage + Supabase
2. **Test offline:** Logout rồi bỏ internet, giỏ hàng vẫn còn
3. **Clear dữ liệu:** Vào Supabase > Table Editor > Delete rows
4. **Debug:** F12 > Console > Xem error messages

## 📞 Hỗ Trợ

Nếu có vấn đề:
1. Kiểm tra Console (F12)
2. Xem [SETUP_GUIDE.md](SETUP_GUIDE.md)
3. Xem [README.md](README.md)
4. Hỏi ChatGPT/Supabase docs

## 🎉 Chúc Mừng!

Bạn đã cài đặt xong TMDT + Supabase! 

Tiếp theo:
- ✅ Thêm nhiều sản phẩm
- ✅ Tuỳ chỉnh giao diện
- ✅ Thêm thanh toán trực tuyến
- ✅ Triển khai lên web

Happy coding! 🚀

-- Supabase Database Schema
-- This SQL file contains all the table definitions needed for the e-commerce application
-- Copy and paste this into your Supabase SQL Editor

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create profiles table (for storing user information)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    full_name VARCHAR(255),
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'profiles_role_check'
    ) THEN
        ALTER TABLE profiles
        ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'user'));
    END IF;
END $$;

UPDATE profiles
SET role = 'user'
WHERE role IS NULL OR role NOT IN ('admin', 'user');

-- 3. Create documents table (tài liệu học tập)
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(500),
    description TEXT,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- 4. Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    product_name VARCHAR(255),
    product_price DECIMAL(10, 2),
    product_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- 5. Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, shipping, delivered, cancelled
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 6. Create order_items table (line items in each order)
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id),
    product_name VARCHAR(255),
    product_price DECIMAL(10, 2),
    quantity INT NOT NULL,
    subtotal DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 7. Create favorites/wishlist table
CREATE TABLE IF NOT EXISTS favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- 8. Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- 9. Create behavior tracking table
CREATE TABLE IF NOT EXISTS behavior_tracking (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(50) NOT NULL,
    activity TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    channel VARCHAR(100) DEFAULT 'Other',
    location VARCHAR(100) DEFAULT 'Online',
    device VARCHAR(50) DEFAULT 'Desktop',
    customer_type VARCHAR(50) DEFAULT 'New'
);

CREATE INDEX IF NOT EXISTS idx_behavior_tracking_session_id ON behavior_tracking(session_id);
CREATE INDEX IF NOT EXISTS idx_behavior_tracking_timestamp ON behavior_tracking(timestamp);

-- 10. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_tracking ENABLE ROW LEVEL SECURITY;

-- Helper function: check current user is admin
CREATE OR REPLACE FUNCTION is_admin(check_user UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM profiles p
        WHERE p.id = check_user
          AND p.role = 'admin'
    );
$$;

-- 11. Create RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id OR is_admin(auth.uid()))
    WITH CHECK (
        (
            auth.uid() = id
            AND role = 'user'
        )
        OR is_admin(auth.uid())
    );

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (
        (auth.uid() = id AND role = 'user')
        OR is_admin(auth.uid())
    );

-- 12. Create RLS Policies for cart_items
DROP POLICY IF EXISTS "Users can view their own cart" ON cart_items;
CREATE POLICY "Users can view their own cart"
    ON cart_items FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert into their own cart" ON cart_items;
CREATE POLICY "Users can insert into their own cart"
    ON cart_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cart" ON cart_items;
CREATE POLICY "Users can update their own cart"
    ON cart_items FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete from their own cart" ON cart_items;
CREATE POLICY "Users can delete from their own cart"
    ON cart_items FOR DELETE
    USING (auth.uid() = user_id);

-- 12. Create RLS Policies for orders
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
CREATE POLICY "Users can insert their own orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
CREATE POLICY "Admins can update all orders"
    ON orders FOR UPDATE
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- 13. Create RLS Policies for order_items
DROP POLICY IF EXISTS "Users can view their order items" ON order_items;
CREATE POLICY "Users can view their order items"
    ON order_items FOR SELECT
    USING (is_admin(auth.uid()) OR EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can insert their order items" ON order_items;
CREATE POLICY "Users can insert their order items"
    ON order_items FOR INSERT
    WITH CHECK (
        is_admin(auth.uid()) OR EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can update all order items" ON order_items;
CREATE POLICY "Admins can update all order items"
    ON order_items FOR UPDATE
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete all order items" ON order_items;
CREATE POLICY "Admins can delete all order items"
    ON order_items FOR DELETE
    USING (is_admin(auth.uid()));

-- 14. Create RLS Policies for favorites
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
CREATE POLICY "Users can view their own favorites"
    ON favorites FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
CREATE POLICY "Users can insert their own favorites"
    ON favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;
CREATE POLICY "Users can delete their own favorites"
    ON favorites FOR DELETE
    USING (auth.uid() = user_id);

-- 15. Create RLS Policies for reviews
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
CREATE POLICY "Anyone can view reviews"
    ON reviews FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can insert their own reviews" ON reviews;
CREATE POLICY "Users can insert their own reviews"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
CREATE POLICY "Users can update their own reviews"
    ON reviews FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;
CREATE POLICY "Users can delete their own reviews"
    ON reviews FOR DELETE
    USING (auth.uid() = user_id);

-- 16. Create RLS Policies for behavior_tracking
DROP POLICY IF EXISTS "Anyone can insert behavior logs" ON behavior_tracking;
CREATE POLICY "Anyone can insert behavior logs"
    ON behavior_tracking FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view behavior logs" ON behavior_tracking;
CREATE POLICY "Admins can view behavior logs"
    ON behavior_tracking FOR SELECT
    USING (is_admin(auth.uid()));

-- 17. Allow public access to products table
DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Anyone can view products"
    ON products FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Only admin can insert products" ON products;
CREATE POLICY "Only admin can insert products"
    ON products FOR INSERT
    WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admin can update products" ON products;
CREATE POLICY "Only admin can update products"
    ON products FOR UPDATE
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admin can delete products" ON products;
CREATE POLICY "Only admin can delete products"
    ON products FOR DELETE
    USING (is_admin(auth.uid()));

-- Chuẩn hóa danh mục cũ về 4 nhóm mới:
-- cg1: Kinh te - Quan tri
-- cg2: CNTT - Ky thuat
-- cg3: Luat - Xa hoi
-- cg4: Ngoai ngu
UPDATE products
SET category = CASE
    WHEN category = 'cg5' THEN 'cg2'
    WHEN category = 'cg6' THEN 'cg1'
    WHEN category IN ('cg7', 'cg8') THEN 'cg3'
    ELSE category
END
WHERE category IN ('cg5', 'cg6', 'cg7', 'cg8');

-- Nếu có dữ liệu test cũ ngoài hệ category hiện tại thì đưa về cg1 để không vỡ filter
UPDATE products
SET category = 'cg1'
WHERE category NOT IN ('cg1', 'cg2', 'cg3', 'cg4');

-- Ràng buộc category chỉ còn 4 mã
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'products_category_check'
    ) THEN
        ALTER TABLE products
        ADD CONSTRAINT products_category_check CHECK (category IN ('cg1', 'cg2', 'cg3', 'cg4'));
    END IF;
END $$;

-- Xóa bộ sample cũ ngoài phạm vi 4 category hiện tại (nếu có)
DELETE FROM products WHERE id LIKE 'cg5-%' OR id LIKE 'cg6-%' OR id LIKE 'cg7-%' OR id LIKE 'cg8-%';

-- Sample data mới theo 4 danh mục (đồng bộ với frontend hiện tại)
INSERT INTO products (id, name, category, price, image, description, stock) VALUES
('cg1-1', 'Kinh te vi mo A1', 'cg1', 39000, 'img/products/generated/economics.svg', 'Tom tat ly thuyet va cau hoi trac nghiem theo chuong', 100),
('cg1-2', 'Kinh te vi mo A2', 'cg1', 41000, 'img/products/generated/economics.svg', 'Bo bai tap ung dung va huong dan giai nhanh', 100),
('cg1-3', 'Kinh te vi mo nang cao', 'cg1', 45000, 'img/products/generated/economics.svg', 'Tong hop mo hinh kinh te vi mo nang cao cho ky thi', 100),
('cg1-4', 'Kinh te vi mo bo de trac nghiem', 'cg1', 37000, 'img/products/generated/economics.svg', '80 cau trac nghiem co dap an giai thich', 100),
('cg1-5', 'Marketing can ban', 'cg1', 45000, 'img/products/generated/economics.svg', 'So do tu duy va de cuong 5 chuong mon marketing', 100),
('cg1-6', 'Marketing tong hop', 'cg1', 47000, 'img/products/generated/economics.svg', 'Mau bai tap lon va bo khung trinh bay bai thi', 100),
('cg1-7', 'Quan tri hoc', 'cg1', 42000, 'img/products/generated/economics.svg', 'Tong hop noi dung trong tam mon quan tri hoc', 100),
('cg1-8', 'Quan tri chien luoc', 'cg1', 49000, 'img/products/generated/economics.svg', 'Khung phan tich SWOT va chien luoc cap don vi', 100),
('cg1-9', 'Tai chinh doanh nghiep', 'cg1', 50000, 'img/products/generated/economics.svg', 'Cong thuc tinh nhanh NPV IRR va bo de on thi', 100),
('cg1-10', 'Nguyen ly ke toan', 'cg1', 46000, 'img/products/generated/economics.svg', 'Dinh khoan mau va bai tap thuc hanh co dap an', 100),

('cg2-1', 'Nhap mon lap trinh C', 'cg2', 39000, 'img/products/generated/programming.svg', 'Tong hop cu phap C va bai tap co ban', 100),
('cg2-2', 'Lap trinh huong doi tuong Java', 'cg2', 48000, 'img/products/generated/programming.svg', 'Class object inheritance va polymorphism', 100),
('cg2-3', 'Cau truc du lieu va giai thuat', 'cg2', 50000, 'img/products/generated/programming.svg', 'Mang linked list stack queue tree do thi', 100),
('cg2-4', 'Co so du lieu', 'cg2', 44000, 'img/products/generated/programming.svg', 'ERD SQL join transaction va bai tap thuc hanh', 100),
('cg2-5', 'He dieu hanh', 'cg2', 47000, 'img/products/generated/programming.svg', 'Process thread scheduling deadlock memory', 100),
('cg2-6', 'Mang may tinh', 'cg2', 46000, 'img/products/generated/programming.svg', 'TCP IP routing subnetting va bo cau hoi on tap', 100),
('cg2-7', 'Ky thuat so', 'cg2', 43000, 'img/products/generated/programming.svg', 'Dai so boole cong logic va mach to hop', 100),
('cg2-8', 'Dien tu co ban', 'cg2', 42000, 'img/products/generated/programming.svg', 'Linh kien co ban mach RC RL va ung dung', 100),
('cg2-9', 'AI co ban', 'cg2', 50000, 'img/products/generated/programming.svg', 'Machine learning nhap mon va bai toan ung dung', 100),
('cg2-10', 'Do an ky thuat phan mem', 'cg2', 50000, 'img/products/generated/programming.svg', 'Mau bao cao do an va checklist bao ve', 100),

('cg3-1', 'Phap luat dai cuong', 'cg3', 39000, 'img/products/generated/social.svg', 'Tong hop quy dinh can nho cho bai thi hoc ky', 100),
('cg3-2', 'Luat dan su 1', 'cg3', 44000, 'img/products/generated/social.svg', 'Che dinh co ban va tinh huong ap dung', 100),
('cg3-3', 'Luat dan su 2', 'cg3', 45000, 'img/products/generated/social.svg', 'Hop dong boi thuong va bo de luyen tap', 100),
('cg3-4', 'Luat thuong mai', 'cg3', 48000, 'img/products/generated/social.svg', 'Hoat dong kinh doanh va nghia vu phap ly', 100),
('cg3-5', 'Luat lao dong', 'cg3', 43000, 'img/products/generated/social.svg', 'Hop dong lao dong luong thuong va tranh chap', 100),
('cg3-6', 'Xa hoi hoc dai cuong', 'cg3', 37000, 'img/products/generated/social.svg', 'Tong quan ly thuyet xa hoi hoc can ban', 100),
('cg3-7', 'Tam ly hoc ung dung', 'cg3', 41000, 'img/products/generated/social.svg', 'Mo hinh hanh vi va ky nang ung dung', 100),
('cg3-8', 'Ky nang tranh bien', 'cg3', 36000, 'img/products/generated/social.svg', 'Khung lap luan rebuttal va mau bai tranh bien', 100),
('cg3-9', 'Quan he cong chung', 'cg3', 42000, 'img/products/generated/social.svg', 'Lap ke hoach PR va bo tieu chi danh gia', 100),
('cg3-10', 'Nghiep vu hanh chinh', 'cg3', 40000, 'img/products/generated/social.svg', 'Quy trinh van thu va mau bieu hanh chinh', 100),

('cg4-1', 'Tieng Anh giao tiep can ban', 'cg4', 35000, 'img/products/generated/english.svg', 'Mau cau giao tiep co ban theo tinh huong', 100),
('cg4-2', 'Tieng Anh giao tiep nang cao', 'cg4', 43000, 'img/products/generated/english.svg', 'Bo chu de giao tiep hoc thuat va cong viec', 100),
('cg4-3', 'Ngu phap TOEIC', 'cg4', 42000, 'img/products/generated/english.svg', 'Tong hop grammar trong tam cho bai thi TOEIC', 100),
('cg4-4', '600 tu vung TOEIC', 'cg4', 39000, 'img/products/generated/english.svg', 'Tu vung theo chu de va bai test mini', 100),
('cg4-5', 'IELTS Writing task 1', 'cg4', 48000, 'img/products/generated/english.svg', 'Template va sample bai viet task 1', 100),
('cg4-6', 'IELTS Writing task 2', 'cg4', 50000, 'img/products/generated/english.svg', 'Khung lap y va bo de writing task 2', 100),
('cg4-7', 'Tieng Trung co ban', 'cg4', 45000, 'img/products/generated/english.svg', 'Phien am pinyin va tu vung nhap mon', 100),
('cg4-8', 'Tieng Nhat N5', 'cg4', 47000, 'img/products/generated/english.svg', 'Ngu phap N5 va bo de on tap JLPT', 100),
('cg4-9', 'Tieng Han so cap 1', 'cg4', 46000, 'img/products/generated/english.svg', 'Mau cau giao tiep va tu vung can ban', 100),
('cg4-10', 'Academic Writing', 'cg4', 49000, 'img/products/generated/english.svg', 'Ky thuat viet hoc thuat cho dai hoc', 100)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    description = EXCLUDED.description,
    stock = EXCLUDED.stock,
    updated_at = NOW();

-- Chuẩn hóa dữ liệu cũ về VND trong khoảng 10k-50k
UPDATE products
SET price = LEAST(
    50000,
    GREATEST(
        10000,
        CASE
            WHEN price > 0 AND price < 1000 THEN ROUND(price * 1000)
            ELSE ROUND(price)
        END
    )
)
WHERE price IS NOT NULL;

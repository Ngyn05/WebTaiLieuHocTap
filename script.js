// Load dữ liệu mẫu nếu Supabase chưa tải xong
const fallbackProducts = [
  // cg1 - Kinh te - Quan tri
  { id: "cg1-1", name: "Kinh tế vi mô A1", category: "cg1", price: 39000, image: "img/products/generated/economics.svg" },
  { id: "cg1-2", name: "Kinh tế vi mô A2", category: "cg1", price: 41000, image: "img/products/generated/economics.svg" },
  { id: "cg1-3", name: "Kinh tế vi mô nâng cao", category: "cg1", price: 45000, image: "img/products/generated/economics.svg" },
  { id: "cg1-4", name: "Kinh tế vi mô bộ đề trắc nghiệm", category: "cg1", price: 37000, image: "img/products/generated/economics.svg" },
  { id: "cg1-5", name: "Marketing căn bản", category: "cg1", price: 45000, image: "img/products/generated/economics.svg" },
  { id: "cg1-6", name: "Marketing tổng hợp", category: "cg1", price: 47000, image: "img/products/generated/economics.svg" },
  { id: "cg1-7", name: "Quản trị học", category: "cg1", price: 42000, image: "img/products/generated/economics.svg" },
  { id: "cg1-8", name: "Quản trị chiến lược", category: "cg1", price: 49000, image: "img/products/generated/economics.svg" },
  { id: "cg1-9", name: "Tài chính doanh nghiệp", category: "cg1", price: 50000, image: "img/products/generated/economics.svg" },
  { id: "cg1-10", name: "Nguyên lý kế toán", category: "cg1", price: 46000, image: "img/products/generated/economics.svg" },

  // cg2 - CNTT - Ky thuat
  { id: "cg2-1", name: "Nhập môn lập trình C", category: "cg2", price: 39000, image: "img/products/generated/programming.svg" },
  { id: "cg2-2", name: "Lập trình hướng đối tượng Java", category: "cg2", price: 48000, image: "img/products/generated/programming.svg" },
  { id: "cg2-3", name: "Cấu trúc dữ liệu và giải thuật", category: "cg2", price: 50000, image: "img/products/generated/programming.svg" },
  { id: "cg2-4", name: "Cơ sở dữ liệu", category: "cg2", price: 44000, image: "img/products/generated/programming.svg" },
  { id: "cg2-5", name: "Hệ điều hành", category: "cg2", price: 47000, image: "img/products/generated/programming.svg" },
  { id: "cg2-6", name: "Mạng máy tính", category: "cg2", price: 46000, image: "img/products/generated/programming.svg" },
  { id: "cg2-7", name: "Kỹ thuật số", category: "cg2", price: 43000, image: "img/products/generated/programming.svg" },
  { id: "cg2-8", name: "Điện tử cơ bản", category: "cg2", price: 42000, image: "img/products/generated/programming.svg" },
  { id: "cg2-9", name: "AI cơ bản", category: "cg2", price: 50000, image: "img/products/generated/programming.svg" },
  { id: "cg2-10", name: "Đồ án kỹ thuật phần mềm", category: "cg2", price: 50000, image: "img/products/generated/programming.svg" },

  // cg3 - Luat - Xa hoi
  { id: "cg3-1", name: "Pháp luật đại cương", category: "cg3", price: 39000, image: "img/products/generated/social.svg" },
  { id: "cg3-2", name: "Luật dân sự 1", category: "cg3", price: 44000, image: "img/products/generated/social.svg" },
  { id: "cg3-3", name: "Luật dân sự 2", category: "cg3", price: 45000, image: "img/products/generated/social.svg" },
  { id: "cg3-4", name: "Luật thương mại", category: "cg3", price: 48000, image: "img/products/generated/social.svg" },
  { id: "cg3-5", name: "Luật lao động", category: "cg3", price: 43000, image: "img/products/generated/social.svg" },
  { id: "cg3-6", name: "Xã hội học đại cương", category: "cg3", price: 37000, image: "img/products/generated/social.svg" },
  { id: "cg3-7", name: "Tâm lý học ứng dụng", category: "cg3", price: 41000, image: "img/products/generated/social.svg" },
  { id: "cg3-8", name: "Kỹ năng tranh biện", category: "cg3", price: 36000, image: "img/products/generated/social.svg" },
  { id: "cg3-9", name: "Quan hệ công chúng", category: "cg3", price: 42000, image: "img/products/generated/social.svg" },
  { id: "cg3-10", name: "Nghiệp vụ hành chính", category: "cg3", price: 40000, image: "img/products/generated/social.svg" },

  // cg4 - Ngoai ngu
  { id: "cg4-1", name: "Tiếng Anh giao tiếp căn bản", category: "cg4", price: 35000, image: "img/products/generated/english.svg" },
  { id: "cg4-2", name: "Tiếng Anh giao tiếp nâng cao", category: "cg4", price: 43000, image: "img/products/generated/english.svg" },
  { id: "cg4-3", name: "Ngữ pháp TOEIC", category: "cg4", price: 42000, image: "img/products/generated/english.svg" },
  { id: "cg4-4", name: "600 từ vựng TOEIC", category: "cg4", price: 39000, image: "img/products/generated/english.svg" },
  { id: "cg4-5", name: "IELTS Writing task 1", category: "cg4", price: 48000, image: "img/products/generated/english.svg" },
  { id: "cg4-6", name: "IELTS Writing task 2", category: "cg4", price: 50000, image: "img/products/generated/english.svg" },
  { id: "cg4-7", name: "Tiếng Trung cơ bản", category: "cg4", price: 45000, image: "img/products/generated/english.svg" },
  { id: "cg4-8", name: "Tiếng Nhật N5", category: "cg4", price: 47000, image: "img/products/generated/english.svg" },
  { id: "cg4-9", name: "Tiếng Hàn sơ cấp 1", category: "cg4", price: 46000, image: "img/products/generated/english.svg" },
  { id: "cg4-10", name: "Academic Writing", category: "cg4", price: 49000, image: "img/products/generated/english.svg" }
];

const fallbackImageBase = 'img/products/generated';
fallbackProducts.forEach((product) => {
  product.image = `${fallbackImageBase}/${product.id}.jpg`;
});

productsData = fallbackProducts;

// Script for navigation bar
const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');
if (bar){
    bar.addEventListener('click', () => {
        nav.classList.add('active');
    })
}

if (close){
    close.addEventListener('click', () => {
        nav.classList.remove('active');
    })
}

function hideNavbar() {
    const header = document.getElementById('header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // cuộn xuống & đã cuộn quá 50px → ẩn navbar
        header.classList.add('hidden');
      } else {
        // cuộn lên → hiện navbar
        header.classList.remove('hidden');
      }
      lastScrollY = currentScrollY;
    });
  };

hideNavbar();
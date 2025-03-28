
// Tạo carousel cho phần phim
document.addEventListener('DOMContentLoaded', function() {
// Lấy các phần tử cần thiết
const movieSlider = document.querySelector('.movie-list-slider');
const slides = document.querySelectorAll('.glide__slide');
const prevButton = document.querySelector('[data-glide-dir="<"]');
const nextButton = document.querySelector('[data-glide-dir=">"]');
const slidesTrack = document.querySelector('.glide__slides');

// Thiết lập các biến
let currentIndex = 0;
const slideWidth = 363; // 358px + 5px margin
const visibleSlides = Math.floor(window.innerWidth / slideWidth);
const totalSlides = slides.length;

// Hàm để di chuyển slides
function moveSlides(index) {
if (index < 0) {
index = totalSlides - visibleSlides;
} else if (index > totalSlides - visibleSlides) {
index = 0;
}

currentIndex = index;
const translateX = -currentIndex * slideWidth;
slidesTrack.style.transform = `translate3d(${translateX}px, 0px, 0px)`;

// Cập nhật trạng thái active
slides.forEach((slide, i) => {
if (i >= currentIndex && i < currentIndex + visibleSlides) {
slide.classList.add('glide__slide--active');
} else {
slide.classList.remove('glide__slide--active');
}
});
}

// Xử lý sự kiện nút prev
prevButton.addEventListener('click', function() {
moveSlides(currentIndex - 1);
});

// Xử lý sự kiện nút next
nextButton.addEventListener('click', function() {
moveSlides(currentIndex + 1);
});

// Xử lý sự kiện tab (Now Playing / Coming Soon)
const tabTriggers = document.querySelectorAll('[role="tab"]');
tabTriggers.forEach(tab => {
tab.addEventListener('click', function() {
const tabId = this.getAttribute('aria-controls');
const tabContent = document.getElementById(tabId);

// Đặt trạng thái active cho tab
tabTriggers.forEach(t => {
t.setAttribute('aria-selected', 'false');
t.setAttribute('data-state', 'inactive');
});
this.setAttribute('aria-selected', 'true');
this.setAttribute('data-state', 'active');

// Hiển thị nội dung tab
document.querySelectorAll('[role="tabpanel"]').forEach(panel => {
panel.setAttribute('data-state', 'inactive');
panel.hidden = true;
});
tabContent.setAttribute('data-state', 'active');
tabContent.hidden = false;

// Reset carousel khi chuyển tab
currentIndex = 0;
moveSlides(0);
});
});

// Thêm hỗ trợ vuốt cho thiết bị di động
let touchStartX = 0;
let touchEndX = 0;

slidesTrack.addEventListener('touchstart', function(e) {
touchStartX = e.changedTouches[0].screenX;
});

slidesTrack.addEventListener('touchend', function(e) {
touchEndX = e.changedTouches[0].screenX;
handleSwipe();
});

function handleSwipe() {
const threshold = 50;
if (touchEndX < touchStartX - threshold) {
// Vuốt sang trái
moveSlides(currentIndex + 1);
} else if (touchEndX > touchStartX + threshold) {
// Vuốt sang phải
moveSlides(currentIndex - 1);
}
}

// Tự động chuyển slide mỗi 5 giây
let autoplayInterval = setInterval(() => {
moveSlides(currentIndex + 1);
}, 5000);

// Dừng tự động chuyển khi người dùng tương tác
movieSlider.addEventListener('mouseenter', () => {
clearInterval(autoplayInterval);
});

movieSlider.addEventListener('mouseleave', () => {
autoplayInterval = setInterval(() => {
moveSlides(currentIndex + 1);
}, 5000);
});

// Khởi tạo carousel
moveSlides(0);

// Cập nhật khi thay đổi kích thước màn hình
window.addEventListener('resize', function() {
const newVisibleSlides = Math.floor(window.innerWidth / slideWidth);
if (newVisibleSlides !== visibleSlides) {
moveSlides(currentIndex);
}
});
});

// Thêm script để xử lý nút "Remind Me"
document.querySelectorAll('button:has(.h-12.w-12)').forEach(button => {
button.addEventListener('click', function() {
const movieTitle = this.closest('.flex').querySelector('.headline').textContent;
alert(`Bạn sẽ nhận được thông báo khi phim "${movieTitle}" ra mắt!`);
});
});

// Thêm hiệu ứng khi hover vào poster phim
document.querySelectorAll('.glide__slide a img').forEach(img => {
img.addEventListener('mouseenter', function() {
this.style.transform = 'scale(1.05)';
this.style.transition = 'transform 0.3s ease';
});

img.addEventListener('mouseleave', function() {
this.style.transform = 'scale(1)';
});
});

// Thêm hiệu ứng cho nút chuyển tab
document.querySelectorAll('[role="tab"]').forEach(tab => {
tab.addEventListener('mouseenter', function() {
if (this.getAttribute('data-state') !== 'active') {
this.style.color = '#3b82f6'; // text-blue-500
}
});

tab.addEventListener('mouseleave', function() {
if (this.getAttribute('data-state') !== 'active') {
this.style.color = '';
}
});
});


document.addEventListener('DOMContentLoaded', function () {
    // Đợi thêm một chút để đảm bảo Angular đã render xong
    setTimeout(() => {
        initializeMovieSlider();
    }, 500);

    function initializeMovieSlider() {
        // Chọn đúng carousel phim bằng selector cụ thể hơn
        const movieSlider = document.querySelector('.movie-list-slider');
        if (!movieSlider) return;

        const slides = movieSlider.querySelectorAll('.glide__slide');
        if (!slides.length) return;

        // Đảm bảo chọn đúng nút trong movie-list-slider
        const prevButton = movieSlider.querySelector('[data-glide-dir="<"]');
        const nextButton = movieSlider.querySelector('[data-glide-dir=">"]');
        const slidesTrack = movieSlider.querySelector('.glide__slides');

        if (!prevButton || !nextButton || !slidesTrack) return;

        // Thiết lập các biến
        let currentIndex = 0;
        let isAnimating = false; // Cờ để tránh chuyển slide khi đang có animation
        const slideWidth = 363; // 358px + 5px margin
        const visibleSlides = Math.floor(window.innerWidth / slideWidth);
        const totalSlides = slides.length;

        // Cập nhật style cho slidesTrack để có transition mượt hơn
        slidesTrack.style.transition = 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)';

        // Hàm di chuyển slides
        function moveSlides(index, instant = false) {
            if (isAnimating) return;
            console.log("Moving to index:", index);

            if (index < 0) {
                index = totalSlides - visibleSlides;
            } else if (index > totalSlides - visibleSlides) {
                index = 0;
            }

            currentIndex = index;
            const translateX = -currentIndex * slideWidth;

            // Nếu instant = true, không có transition
            if (instant) {
                slidesTrack.style.transition = 'none';
                slidesTrack.style.transform = `translate3d(${translateX}px, 0px, 0px)`;
                // Force reflow để đảm bảo transition 'none' được áp dụng ngay lập tức
                slidesTrack.offsetHeight;
                // Khôi phục transition sau đó
                slidesTrack.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
            } else {
                isAnimating = true;
                slidesTrack.style.transform = `translate3d(${translateX}px, 0px, 0px)`;

                // Đặt lại cờ isAnimating khi transition kết thúc
                setTimeout(() => {
                    isAnimating = false;
                }, 200); // Thời gian phải khớp với thời gian transition
            }

            // Cập nhật trạng thái active và thêm hiệu ứng cho các slide
            slides.forEach((slide, i) => {
                // Slide hiện tại và các slide hiển thị
                if (i >= currentIndex && i < currentIndex + visibleSlides) {
                    slide.classList.add('glide__slide--active');
                    slide.style.opacity = '1';
                    slide.style.transform = 'scale(1)';
                } else {
                    slide.classList.remove('glide__slide--active');
                    // Làm mờ dần các slide không hiển thị
                    slide.style.opacity = '0.7';
                    slide.style.transform = 'scale(0.95)';
                }
            });
        }

        // Thêm sự kiện click với animation mượt hơn
        prevButton.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (!isAnimating) {
                // Thêm hiệu ứng nhấn nút
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
                moveSlides(currentIndex - 1);
            }
        });

        nextButton.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (!isAnimating) {
                // Thêm hiệu ứng nhấn nút
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
                moveSlides(currentIndex + 1);
            }
        });

        // Thêm hỗ trợ vuốt cho thiết bị di động
        let touchStartX = 0;
        let touchEndX = 0;

        movieSlider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        movieSlider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50; // Ngưỡng để xác định vuốt
            if (touchEndX + swipeThreshold < touchStartX) {
                // Vuốt sang trái -> Slide tiếp theo
                moveSlides(currentIndex + 1);
            } else if (touchEndX > touchStartX + swipeThreshold) {
                // Vuốt sang phải -> Slide trước đó
                moveSlides(currentIndex - 1);
            }
        }

        // Tự động chuyển slide
        let autoplayInterval = setInterval(() => {
            if (!isAnimating) {
                moveSlides(currentIndex + 1);
            }
        }, 5000);

        // Dừng tự động chuyển khi hover
        movieSlider.addEventListener('mouseenter', () => {
            clearInterval(autoplayInterval);
        });

        movieSlider.addEventListener('mouseleave', () => {
            autoplayInterval = setInterval(() => {
                if (!isAnimating) {
                    moveSlides(currentIndex + 1);
                }
            }, 5000);
        });

        // Xử lý resize cửa sổ để điều chỉnh số lượng slide hiển thị
        window.addEventListener('resize', debounce(() => {
            const newVisibleSlides = Math.floor(window.innerWidth / slideWidth);
            if (newVisibleSlides !== visibleSlides) {
                // Nếu số lượng slide hiển thị thay đổi, cập nhật lại
                // và di chuyển đến vị trí đầu tiên
                moveSlides(0, true);
            }
        }, 250));

        // Hàm debounce để tối ưu sự kiện resize
        function debounce(func, wait) {
            let timeout;
            return function () {
                const context = this;
                const args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    func.apply(context, args);
                }, wait);
            };
        }

        // Khởi tạo vị trí ban đầu
        moveSlides(4, true);

        // Thêm hiệu ứng hover cho các nút điều hướng
        prevButton.style.transition = 'transform 0.2s, background-color 0.3s';
        nextButton.style.transition = 'transform 0.2s, background-color 0.3s';
    }
});

// Thêm hiệu ứng hover cho ảnh phim
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        // Chỉ áp dụng cho slide phim
        document.querySelectorAll('.movie-list-slider .glide__slide a img').forEach(img => {
            // Thêm style transition chung
            img.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';

            img.addEventListener('mouseenter', function () {
                this.style.transform = 'scale(1.05)';
                this.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
            });

            img.addEventListener('mouseleave', function () {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = 'none';
            });
        });
    }, 600);
});
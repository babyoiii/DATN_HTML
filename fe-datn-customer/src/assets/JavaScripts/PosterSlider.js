document.addEventListener('DOMContentLoaded', function () {
    // Đợi thêm một chút để đảm bảo Angular đã render xong
    setTimeout(() => {
        initializePosterSlider();
    }, 500);

    function initializePosterSlider() {
        // Chọn đúng carousel banner bằng selector cụ thể
        const posterSlider = document.querySelector('.Poster_Slider .glide');
        if (!posterSlider) return;

        const slides = posterSlider.querySelectorAll('.glide__slide');
        if (!slides.length) return;

        // Đảm bảo chọn đúng nút trong Poster_Slider
        const prevButton = posterSlider.querySelector('[data-glide-dir="<"]');
        const nextButton = posterSlider.querySelector('[data-glide-dir=">"]');
        const slidesTrack = posterSlider.querySelector('.glide__slides');
        const bullets = posterSlider.querySelectorAll('.glide__bullet');

        if (!prevButton || !nextButton || !slidesTrack) return;

        // Thiết lập các biến
        let currentIndex = 0;
        let isAnimating = false; // Cờ để tránh chuyển slide khi đang có animation
        const slideWidth = slides[0].offsetWidth + 5; // Lấy kích thước slide thực tế + margin
        const totalSlides = slides.length;

        // Cập nhật style cho slidesTrack để có transition mượt hơn
        slidesTrack.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';

        // Hàm di chuyển slides
        function moveSlides(index, instant = false) {
            if (isAnimating) return;

            if (index < 0) {
                index = totalSlides - 1;
            } else if (index >= totalSlides) {
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
                slidesTrack.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
            } else {
                isAnimating = true;
                slidesTrack.style.transform = `translate3d(${translateX}px, 0px, 0px)`;

                // Đặt lại cờ isAnimating khi transition kết thúc
                setTimeout(() => {
                    isAnimating = false;
                }, 800); // Thời gian phải khớp với thời gian transition
            }

            // Cập nhật trạng thái active và các bullets
            slides.forEach((slide, i) => {
                if (i === currentIndex) {
                    slide.setAttribute('aria-hidden', 'false');
                    if (bullets[i]) bullets[i].classList.add('glide__bullet--active');
                } else {
                    slide.setAttribute('aria-hidden', 'true');
                    if (bullets[i]) bullets[i].classList.remove('glide__bullet--active');
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

        // Thêm sự kiện click cho các bullet indicators
        bullets.forEach((bullet, i) => {
            bullet.addEventListener('click', function () {
                if (!isAnimating && currentIndex !== i) {
                    moveSlides(i);
                }
            });
        });

        // Thêm hỗ trợ vuốt cho thiết bị di động
        let touchStartX = 0;
        let touchEndX = 0;

        posterSlider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            // Tạm dừng tự động chuyển slide khi có tương tác
            clearInterval(autoplayInterval);
        }, { passive: true });

        posterSlider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            // Khởi động lại tự động chuyển slide sau khi tương tác
            autoplayInterval = setInterval(() => {
                if (!isAnimating) {
                    moveSlides(currentIndex + 1);
                }
            }, 7000);
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

        // Tự động chuyển slide - thời gian dài hơn vì đây là banner chính
        let autoplayInterval = setInterval(() => {
            if (!isAnimating) {
                moveSlides(currentIndex + 1);
            }
        }, 7000);

        // Dừng tự động chuyển khi hover
        posterSlider.addEventListener('mouseenter', () => {
            clearInterval(autoplayInterval);
        });

        posterSlider.addEventListener('mouseleave', () => {
            autoplayInterval = setInterval(() => {
                if (!isAnimating) {
                    moveSlides(currentIndex + 1);
                }
            }, 7000);
        });

        // Lắng nghe sự kiện resize của cửa sổ
        window.addEventListener('resize', debounce(() => {
            // Cập nhật lại chiều rộng của slide khi resize
            const newSlideWidth = slides[0].offsetWidth + 5;

            // Di chuyển đến slide hiện tại với kích thước mới
            const translateX = -currentIndex * newSlideWidth;
            slidesTrack.style.transition = 'none';
            slidesTrack.style.transform = `translate3d(${translateX}px, 0px, 0px)`;
            slidesTrack.offsetHeight;
            slidesTrack.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
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
        moveSlides(0, true);

        // Thêm hiệu ứng hover cho các nút điều hướng
        prevButton.style.transition = 'transform 0.2s, background-color 0.3s';
        nextButton.style.transition = 'transform 0.2s, background-color 0.3s';

        // Thêm hiệu ứng khi hover vào nút
        prevButton.addEventListener('mouseenter', function () {
            this.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        });

        prevButton.addEventListener('mouseleave', function () {
            this.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        });

        nextButton.addEventListener('mouseenter', function () {
            this.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        });

        nextButton.addEventListener('mouseleave', function () {
            this.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        });
    }
});


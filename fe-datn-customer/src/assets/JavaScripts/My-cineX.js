document.addEventListener('DOMContentLoaded', function() {
    // Lấy tất cả các thẻ A trong navigation
    const navLinks = document.querySelectorAll('nav a');
    const activeClass = 'text-white underline decoration-2 underline-offset-[10px]';
    
    // Hàm để xóa class active từ tất cả các liên kết
    function removeActiveClassFromAll() {
        navLinks.forEach(link => {
            link.classList.remove('text-white');
            link.classList.remove('underline');
            link.classList.remove('decoration-2');
            link.classList.remove('underline-offset-[10px]');
        });
    }
    
    // Thêm sự kiện click cho mỗi liên kết
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Xóa class active từ tất cả các liên kết
            removeActiveClassFromAll();
            
            // Thêm class active cho liên kết được click
            this.classList.add('text-white');
            this.classList.add('underline');
            this.classList.add('decoration-2');
            this.classList.add('underline-offset-[10px]');
        });
    });
    
    // Kiểm tra URL hiện tại để đánh dấu liên kết active
    function checkCurrentRoute() {
        const currentPath = window.location.pathname;
        
        navLinks.forEach(link => {
            // Lấy route từ thuộc tính [routerLink]
            const routeAttr = link.getAttribute('[routerLink]');
            if (routeAttr) {
                const route = routeAttr.replace(/['"]/g, ''); // Loại bỏ dấu ngoặc kép hoặc đơn
                
                // Nếu đường dẫn hiện tại chứa route này
                if (currentPath.includes(route)) {
                    removeActiveClassFromAll();
                    link.classList.add('text-white');
                    link.classList.add('underline');
                    link.classList.add('decoration-2');
                    link.classList.add('underline-offset-[10px]');
                }
            }
        });
    }
    
    // Kiểm tra route khi trang được tải
    checkCurrentRoute();
    
    // Lắng nghe sự kiện thay đổi URL (nếu sử dụng History API)
    window.addEventListener('popstate', checkCurrentRoute);
});

document.addEventListener('DOMContentLoaded', function() {
    // Biến toàn cục để theo dõi trạng thái
    let activeDropdown = null;
    let activeTrigger = null;
    let isMouseInMenu = false;
    
    // Hàm xử lý hiển thị dropdown menu
    function setupDropdownMenu(triggerElement, dropdownElement) {
        if (!triggerElement || !dropdownElement) return;
        
        // Xử lý khi hover vào menu item
        triggerElement.addEventListener('mouseenter', function() {
            isMouseInMenu = true;
            showDropdown(triggerElement, dropdownElement);
        });
        
        // Xử lý khi click vào menu item
        triggerElement.addEventListener('click', function(e) {
            e.preventDefault();
            if (activeDropdown === dropdownElement) {
                hideDropdown(triggerElement, dropdownElement);
            } else {
                showDropdown(triggerElement, dropdownElement);
            }
        });
        
        // Xử lý khi rời khỏi menu item
        triggerElement.addEventListener('mouseleave', function(e) {
            isMouseInMenu = false;
            
            // Quan trọng: Kiểm tra xem chuột có đang di chuyển vào dropdown không
            const rect = dropdownElement.getBoundingClientRect();
            const goingToDropdown = 
                e.clientY >= rect.top - 10 && // Thêm một khoảng đệm 10px
                e.clientY <= rect.bottom &&
                e.clientX >= rect.left &&
                e.clientX <= rect.right;
            
            if (!goingToDropdown) {
                // Nếu không di chuyển vào dropdown, đợi một chút rồi kiểm tra lại
                setTimeout(() => {
                    if (!isMouseInMenu && activeDropdown === dropdownElement) {
                        hideDropdown(triggerElement, dropdownElement);
                    }
                }, 150);
            }
        });
        
        // Xử lý khi di chuột vào dropdown
        dropdownElement.addEventListener('mouseenter', function() {
            isMouseInMenu = true;
        });
        
        // Xử lý khi rời khỏi dropdown
        dropdownElement.addEventListener('mouseleave', function(e) {
            isMouseInMenu = false;
            
            // Kiểm tra xem chuột có đang di chuyển vào trigger không
            const rect = triggerElement.getBoundingClientRect();
            const goingToTrigger = 
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom &&
                e.clientX >= rect.left &&
                e.clientX <= rect.right;
            
            if (!goingToTrigger) {
                // Nếu không di chuyển vào trigger, đợi một chút rồi kiểm tra lại
                setTimeout(() => {
                    if (!isMouseInMenu && activeDropdown === dropdownElement) {
                        hideDropdown(triggerElement, dropdownElement);
                    }
                }, 150);
            }
        });
    }
    
    // Hàm hiển thị dropdown
    function showDropdown(triggerElement, dropdownElement) {
        // Đóng dropdown hiện tại nếu có
        if (activeDropdown && activeDropdown !== dropdownElement && activeTrigger) {
            hideDropdown(activeTrigger, activeDropdown);
        }
        
        // Cập nhật trạng thái của button trigger
        const triggerButton = triggerElement.querySelector('button');
        if (triggerButton) {
            triggerButton.setAttribute('data-state', 'open');
            triggerButton.setAttribute('aria-expanded', 'true');
        }
        
        // Hiển thị dropdown
        dropdownElement.removeAttribute('hidden');
        
        // Hiển thị các span ẩn trong trigger
        const hiddenSpans = triggerElement.querySelectorAll('span[hidden]');
        hiddenSpans.forEach(span => span.removeAttribute('hidden'));
        
        // Cập nhật trạng thái toàn cục
        activeDropdown = dropdownElement;
        activeTrigger = triggerElement;
    }
    
    // Hàm ẩn dropdown
    function hideDropdown(triggerElement, dropdownElement) {
        // Cập nhật trạng thái của button trigger
        const triggerButton = triggerElement.querySelector('button');
        if (triggerButton) {
            triggerButton.setAttribute('data-state', 'closed');
            triggerButton.setAttribute('aria-expanded', 'false');
        }
        
        // Ẩn dropdown
        dropdownElement.setAttribute('hidden', '');
        
        // Quan trọng: Thêm thuộc tính hidden vào các span trong li
        const spans = triggerElement.querySelectorAll('span[aria-hidden="true"]');
        spans.forEach(span => span.setAttribute('hidden', ''));
        
        // Reset trạng thái toàn cục
        if (activeDropdown === dropdownElement) {
            activeDropdown = null;
            activeTrigger = null;
        }
    }
    
    // Tìm và thiết lập cho My AMC dropdown
    const myAmcTrigger = document.querySelector('li[aria-label="My AMC"]');
    const myAmcDropdown = document.querySelector('div[data-orientation="horizontal"].absolute.z-20.w-full');
    if (myAmcTrigger && myAmcDropdown) {
        setupDropdownMenu(myAmcTrigger, myAmcDropdown);
    }
    
    // Thiết lập cho tất cả các dropdown khác
    const allNavItems = document.querySelectorAll('button[id^="radix-:r0:-trigger-"]');
    allNavItems.forEach(item => {
        const triggerLi = item.closest('li');
        const contentId = item.getAttribute('aria-controls');
        if (contentId && triggerLi) {
            const dropdownContent = document.getElementById(contentId);
            if (dropdownContent) {
                setupDropdownMenu(triggerLi, dropdownContent);
            }
        }
    });
    
    // Xử lý đóng tất cả dropdown khi click ra ngoài
    document.addEventListener('click', function(e) {
        if (!activeDropdown || !activeTrigger) return;
        
        // Kiểm tra xem click có phải là trên button trigger không
        const triggerButton = activeTrigger.querySelector('button');
        if (triggerButton && triggerButton.contains(e.target)) {
            return; // Bỏ qua nếu click vào trigger button (đã xử lý ở sự kiện click của trigger)
        }
        
        // Nếu click không phải trong dropdown và không phải trong trigger
        if (!activeDropdown.contains(e.target) && !activeTrigger.contains(e.target)) {
            hideDropdown(activeTrigger, activeDropdown);
        }
    });
    
    // Xử lý đóng dropdown khi nhấn Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && activeDropdown && activeTrigger) {
            hideDropdown(activeTrigger, activeDropdown);
        }
    });
});

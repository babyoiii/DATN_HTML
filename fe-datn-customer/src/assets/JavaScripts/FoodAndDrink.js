
document.addEventListener('DOMContentLoaded', function () {

    const style = document.createElement('style');
    style.textContent = `
            .accordion__content {
                transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
                overflow: hidden;
            }
            
            .accordion__content[data-state="closed"] {
                max-height: 0;
                opacity: 0;
            }
            
            .accordion__content[data-state="open"] {
                max-height: 2000px; /* Giá trị đủ lớn để chứa nội dung */
                opacity: 1;
            }
            
            .accordion__chevron {
                transition: transform 0.3s ease;
            }
            
            [data-state="open"] .accordion__chevron {
                transform: rotate(180deg);
            }
        `;
    document.head.appendChild(style);

    // Chọn tất cả các phần tử trigger trong grid
    const triggerElements = document.querySelectorAll('.grid.gap-4 .absolute.bottom-0.flex.w-full.items-center.justify-between.p-2.backdrop-blur-xl.backdrop-brightness-50');

    // Thiết lập ban đầu cho tất cả các accordion content
    document.querySelectorAll('.grid.gap-4 .accordion__content').forEach(content => {
        const state = content.getAttribute('data-state');
        if (state === 'closed') {
            // Không sử dụng hidden nữa mà dùng max-height và opacity
            content.removeAttribute('hidden');
        }
    });

    // Thêm sự kiện click cho mỗi phần tử trigger
    triggerElements.forEach(function (triggerElement) {
        triggerElement.addEventListener('click', function () {
            // Tìm phần tử cha có data-state và data-orientation="vertical"
            const parentElement = this.closest('div[data-state][data-orientation="vertical"]');

            // Lấy trạng thái hiện tại của phần tử cha
            const isOpen = parentElement.getAttribute('data-state') === 'open';

            // Trước tiên, đóng tất cả các accordion khác
            const allAccordions = document.querySelectorAll('.grid.gap-4 > div[data-state][data-orientation="vertical"]');
            allAccordions.forEach(function (accordion) {
                // Đóng tất cả các accordion khác
                if (accordion !== parentElement) {
                    // Đặt data-state của accordion thành "closed"
                    accordion.setAttribute('data-state', 'closed');

                    // Tìm và cập nhật nút trigger trong accordion này
                    const button = accordion.querySelector('button[aria-expanded]');
                    if (button) {
                        button.setAttribute('aria-expanded', 'false');
                        button.setAttribute('data-state', 'closed');
                    }

                    // Tìm và cập nhật nội dung accordion
                    const content = accordion.querySelector('div[role="region"]');
                    if (content) {
                        content.setAttribute('data-state', 'closed');
                        // Không sử dụng hidden nữa
                        // content.setAttribute('hidden', '');
                    }
                }
            });

            // Sau đó, chuyển đổi trạng thái của accordion hiện tại (toggle)
            // Trạng thái mới sẽ là ngược lại với trạng thái hiện tại
            const newState = isOpen ? 'closed' : 'open';
            const newAriaExpanded = isOpen ? 'false' : 'true';

            // Thay đổi data-state của phần tử cha
            parentElement.setAttribute('data-state', newState);

            // Tìm nút trigger và thay đổi aria-expanded
            const buttonTrigger = parentElement.querySelector('button[aria-expanded]');
            if (buttonTrigger) {
                buttonTrigger.setAttribute('aria-expanded', newAriaExpanded);
                buttonTrigger.setAttribute('data-state', newState);
            }

            // Tìm nội dung accordion và xử lý trạng thái
            const accordionContent = parentElement.querySelector('div[role="region"]');
            if (accordionContent) {
                accordionContent.setAttribute('data-state', newState);
                // Không sử dụng hidden nữa để cho phép transition hoạt động
                // if (newState === 'open') {
                //     accordionContent.removeAttribute('hidden');
                // } else {
                //     accordionContent.setAttribute('hidden', '');
                // }
            }
        });
    });
});

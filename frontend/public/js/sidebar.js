class SidebarComponent {
    constructor() {
        this.init();
    }

    init() {
        const sidebarContainer = document.getElementById('sidebar-container');
        if (!sidebarContainer) return;

        sidebarContainer.innerHTML = this.getSidebarHTML();
        this.highlightActiveLink();
        this.setupMobileMenu();
        this.setupLogout();
    }

    getSidebarHTML() {
        return `
        <aside class="w-64 h-full bg-white border-r border-gray-200 hidden lg:flex flex-col flex-shrink-0">
            <div class="h-20 flex items-center px-8 border-b border-gray-100 mb-6 flex-shrink-0">
                <div class="w-10 h-10 bg-gradient-to-br from-[#059669] to-[#047857] rounded-xl flex items-center justify-center text-white font-bold mr-3 shadow-md">
                    N
                </div>
                <span class="font-bold text-lg tracking-tight text-gray-900">NNAK Admin</span>
            </div>

            <nav class="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                <div class="text-xs font-bold text-gray-400 uppercase mb-2 px-2 mt-4">Main Menu</div>
                
                <a href="admin.html" class="nav-item flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition">
                    <svg data-lucide="layout-grid" width="18"></svg> Dashboard
                </a>
                
                <a href="members.html" class="nav-item flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition">
                    <svg data-lucide="users" width="18"></svg> Members
                </a>
                
                <a href="analytics.html" class="nav-item flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition">
                    <svg data-lucide="bar-chart-2" width="18"></svg> Analytics
                </a>
                
                <a href="transactions.html" class="nav-item flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition">
                    <svg data-lucide="credit-card" width="18"></svg> Transactions
                </a>

                <div class="text-xs font-bold text-gray-400 uppercase mt-6 mb-2 px-2">Management</div>
                
                <a href="events.html" class="nav-item flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition">
                    <svg data-lucide="calendar" width="18"></svg> Events
                </a>

                <a href="cpd.html" class="nav-item flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition">
                    <svg data-lucide="award" width="18"></svg> CPD Points
                </a>
                
                <a href="applications.html" class="nav-item flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition justify-between">
                    <div class="flex items-center gap-3"> 
                        <svg data-lucide="file-check" width="18"></svg> Applications
                    </div>
                    <span class="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
                </a>
                
                <a href="generate_ids.html" class="nav-item flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition">
                    <svg data-lucide="wand-2" width="18"></svg> Generate IDs
                </a>

                <a href="settings.html" class="nav-item flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition">
                    <svg data-lucide="settings" width="18"></svg> Settings
                </a>
            </nav>

            <div class="p-4 border-t border-gray-100 flex-shrink-0">
                <a href="#" id="logoutBtn" class="flex items-center gap-3 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition font-medium text-sm">
                    <svg data-lucide="log-out" width="16"></svg> Logout
                </a>
            </div>
        </aside>
        `;
    }

    highlightActiveLink() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const links = document.querySelectorAll('.nav-item');

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath) {
                // Remove default classes
                link.classList.remove('text-gray-600', 'hover:bg-gray-50', 'hover:text-gray-900');
                // Add active classes
                link.classList.add('text-[#047857]', 'bg-[#d1fae5]', 'font-bold');
            }
        });

        // Mobile Link Highlighting (if applicable)
        const mobileLinks = document.querySelectorAll('.mobile-nav-item');
        mobileLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath) {
                link.classList.remove('text-gray-400', 'font-medium');
                link.classList.add('text-green-600', 'font-bold');
            }
        });
    }

    setupMobileMenu() {
        // Find existing mobile nav toggle if it exists on the page
        const menuBtn = document.querySelector('button svg[data-lucide="menu"]')?.parentElement;
        if (menuBtn) {
            // Re-initialize lucide icons if strictly needed or ensure listeners
            if (window.lucide) window.lucide.createIcons();
        }
    }

    setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Check if Swal is available (it should be)
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Logout?',
                        text: "Are you sure you want to end your session?",
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonColor: '#059669',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, logout'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = '../index.html';
                        }
                    });
                } else {
                    if (confirm("Are you sure you want to logout?")) {
                        window.location.href = '../index.html';
                    }
                }
            });
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SidebarComponent();
    // Re-run icon creation since we just injected new SVG markup
    if (window.lucide) {
        window.lucide.createIcons();
    }
});

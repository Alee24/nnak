/**
 * Admin Dashboard Scripts
 * Handles Sidebar, Charts, and Shared Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // Sidebar Active State
    const path = window.location.pathname.split('/').pop();
    const links = document.querySelectorAll('.sidebar-link');
    links.forEach(link => {
        if (link.getAttribute('href') === path) {
            link.classList.add('active');
        }
    });
});

// Admin API Handler
const AdminAPI = {
    baseUrl: '/api',

    // Helper to make authenticated requests
    fetch: async (url, options = {}) => {
        const config = {
            credentials: 'include', // CRITICAL: Send session cookies
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        const response = await fetch(url, config);

        // Handle auth errors with detailed message
        if (response.status === 401) {
            const errorData = await response.json().catch(() => ({ error: 'Authentication required' }));
            const errorMessage = errorData.error || 'Session expired. Please login again.';

            alert(errorMessage + ' - Redirecting to login...');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            throw new Error(errorMessage);
        }

        if (!response.ok) {
            // Extract detailed error from response
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }

        return response;
    },

    // --- Members ---
    getMembers: async (page = 1, limit = 20, status = '', search = '') => {
        let url = `http://localhost:8000/index.php?request=api/member&page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        if (search) url = `http://localhost:8000/index.php?request=api/member/search&q=${encodeURIComponent(search)}`;

        try {
            const response = await AdminAPI.fetch(url);

            // Handle JSON parsing errors specifically for debugging
            const text = await response.text();
            let data;

            try {
                data = JSON.parse(text);
            } catch (e) {
                // If it fails to parse, it's likely HTML error from PHP
                console.error('Members API Error (Invalid JSON):', text);

                // Try to render it in the debug container if available
                const debugContainer = document.getElementById('debug-error-display');
                if (debugContainer) {
                    debugContainer.classList.remove('hidden');
                    debugContainer.innerHTML = `
                        <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4 relative shadow-md rounded-r-lg">
                             <button onclick="this.parentElement.parentElement.classList.add('hidden')" class="absolute top-2 right-2 text-red-400 hover:text-red-700">
                                <svg data-lucide="x" width="16"></svg>
                            </button>
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <div class="ml-3 w-full">
                                    <h3 class="text-sm font-medium text-red-800">Backend Error (HTML Response)</h3>
                                    <div class="mt-2 text-xs text-red-700 overflow-auto max-h-60 p-3 bg-white rounded border border-red-200 font-mono whitespace-pre-wrap">
                                        ${text.replace(/</g, '&lt;')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    if (window.lucide) lucide.createIcons();
                }

                throw new Error('Server returned invalid JSON. Check debug output below.');
            }

            if (!response.ok) throw new Error(data.error || 'Failed to fetch members');
            return data;
        } catch (error) {
            console.error('Error fetching members:', error);
            throw error;
        }
    },

    createMember: async (data) => {
        try {
            const response = await AdminAPI.fetch('http://localhost:8000/index.php?request=api/member', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            const resData = await response.json();
            if (!response.ok) throw new Error(resData.error || 'Failed to create member');
            return resData;
        } catch (error) {
            console.error('Error creating member:', error);
            throw error;
        }
    },

    updateMember: async (id, data) => {
        try {
            const response = await AdminAPI.fetch(`http://localhost:8000/index.php?request=api/member/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            const resData = await response.json();
            if (!response.ok) throw new Error(resData.error || 'Failed to update member');
            return resData;
        } catch (error) {
            console.error('Error updating member:', error);
            throw error;
        }
    },

    deleteMember: async (id) => {
        if (!confirm('Are you sure you want to deactivate this member?')) return;
        try {
            const response = await AdminAPI.fetch(`http://localhost:8000/index.php?request=api/member/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to delete member');
            return data;
        } catch (error) {
            console.error('Error deleting member:', error);
            throw error;
        }
    },

    // --- Events ---
    getEvents: async (status = 'all') => {
        try {
            const response = await AdminAPI.fetch(`http://localhost:8000/index.php?request=api/event&status=${status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching events:', error);
            return null;
        }
    },

    createEvent: async (data) => {
        try {
            const response = await AdminAPI.fetch('http://localhost:8000/index.php?request=api/event', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    },

    deleteEvent: async (id) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            await AdminAPI.fetch(`http://localhost:8000/index.php?request=api/event/${id}`, { method: 'DELETE' });
            return true;
        } catch (error) {
            console.error('Error deleting event:', error);
            return false;
        }
    },

    // --- Payments ---
    getPayments: async (page = 1, limit = 20, status = '') => {
        let url = `http://localhost:8000/index.php?request=api/payment&all=true&page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;

        try {
            const response = await AdminAPI.fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Error fetching payments:', error);
            return null;
        }
    },

    createPayment: async (data) => {
        try {
            const response = await AdminAPI.fetch('http://localhost:8000/index.php?request=api/payment', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            const resData = await response.json();
            if (!response.ok) throw new Error(resData.error || 'Failed to record payment');
            return resData;
        } catch (error) {
            console.error('Error recording payment:', error);
            throw error;
        }
    },

    // --- Reports ---
    getStats: async () => {
        try {
            const response = await AdminAPI.fetch('http://localhost:8000/index.php?request=api/report/dashboard');
            return await response.json();
        } catch (error) {
            console.error('Error fetching stats:', error);
            return null;
        }
    },

    getAnalytics: async (type) => {
        try {
            const response = await AdminAPI.fetch(`http://localhost:8000/index.php?request=api/report/${type}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${type} report:`, error);
            return null;
        }
    },

    // --- Auth ---
    logout: async () => {
        try {
            await AdminAPI.fetch('http://localhost:8000/index.php?request=api/auth/logout', { method: 'POST' });
        } catch (e) {
            console.error('Logout failed but proceeding', e);
        }
        window.location.href = 'login.html';
    }
};

// Logout Handler
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            AdminAPI.logout();
        });
    }
});

window.AdminAPI = AdminAPI;

// Utility Utils
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
}

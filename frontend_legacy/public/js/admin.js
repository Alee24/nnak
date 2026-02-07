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
    getBaseUrl: () => {
        return '/api';
    },

    // Helper to make authenticated requests
    fetch: async (url, options = {}) => {
        const config = {
            credentials: 'include', // CRITICAL: Send session cookies
            headers: {
                ...options.headers
            },
            ...options
        };

        // Auto-set JSON content type if not FormData and not already set
        if (!(options.body instanceof FormData) && !config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }

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

    // Unified request handler to fix URL joining and path issues
    request: async (method, endpoint, body = null) => {
        const baseUrl = AdminAPI.getBaseUrl();
        // If endpoint starts with /, and baseUrl ends with api, we get api/endpoint
        // If endpoint has ?, we need to turn it into & because baseUrl already has ?request=api
        const url = `${baseUrl}${endpoint}`;
        const options = { method };
        if (body) options.body = JSON.stringify(body);

        const response = await AdminAPI.fetch(url, options);
        return await response.json();
    },

    get: async (endpoint) => {
        return await AdminAPI.request('GET', endpoint);
    },

    post: async (endpoint, body) => {
        return await AdminAPI.request('POST', endpoint, body);
    },

    put: async (endpoint, body) => {
        return await AdminAPI.request('PUT', endpoint, body);
    },

    // --- Members ---
    getMembers: async (page = 1, limit = 20, status = '', search = '') => {
        let endpoint = `/member?page=${page}&limit=${limit}`;
        if (status) endpoint += `&status=${status}`;
        if (search) endpoint = `/member/search?q=${encodeURIComponent(search)}`;

        return await AdminAPI.get(endpoint);
    },

    getMember: async (id) => {
        return await AdminAPI.get(`/member/${id}`);
    },

    createMember: async (data) => {
        return await AdminAPI.post('/member', data);
    },

    updateMember: async (id, data) => {
        return await AdminAPI.put(`/member/${id}`, data);
    },

    deleteMember: async (id) => {
        if (!confirm('Are you sure you want to deactivate this member?')) return;
        return await AdminAPI.request('DELETE', `/member/${id}`);
    },

    updateMemberStatus: async (id, status) => {
        return await AdminAPI.put(`/member/${id}/status`, { status });
    },

    getCPDPoints: async (id) => {
        return await AdminAPI.get(`/member/${id}/cpd-points`);
    },

    awardCPDPoints: async (id, data) => {
        return await AdminAPI.post(`/member/${id}/cpd-points`, data);
    },

    updateLicense: async (id, data) => {
        return await AdminAPI.put(`/member/${id}/license`, data);
    },

    // --- Events ---
    getEvents: async (status = 'all') => {
        return await AdminAPI.get(`/event?status=${status}`);
    },

    createEvent: async (data) => {
        try {
            const body = data instanceof FormData ? data : JSON.stringify(data);
            const response = await AdminAPI.fetch(`${AdminAPI.getBaseUrl()}/event`, {
                method: 'POST',
                body: body
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    },

    deleteEvent: async (id) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        return await AdminAPI.request('DELETE', `/event/${id}`);
    },

    // --- Payments ---
    getPayments: async (page = 1, limit = 20, status = '') => {
        let endpoint = `/payment?all=true&page=${page}&limit=${limit}`;
        if (status) endpoint += `&status=${status}`;
        return await AdminAPI.get(endpoint);
    },

    createPayment: async (data) => {
        try {
            const response = await AdminAPI.fetch(`${AdminAPI.getBaseUrl()}/payment`, {
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

    fetchJson: async (endpoint, options = {}) => {
        try {
            const response = await AdminAPI.fetch(`${AdminAPI.getBaseUrl()}/${endpoint}`, options);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            return null;
        }
    },

    // --- Members ---
    getStats: async () => {
        return await AdminAPI.get('/report/dashboard');
    },

    getAnalytics: async (type) => {
        return await AdminAPI.get(`/report/${type}`);
    },

    // --- Auth ---
    logout: async () => {
        try {
            await AdminAPI.fetch(`${AdminAPI.getBaseUrl()}/auth/logout`, { method: 'POST' });
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

// Global Actions
async function generateMemberIds(event) {
    if (event) event.preventDefault();
    if (!confirm('Are you sure you want to generate IDs for all active members who do not have one?')) return;

    // Show global loading if possible, or use alert
    // If called from button, show spinner
    let btn = null;
    let originalContent = '';

    if (event && event.target) {
        btn = event.target.closest('button') || event.target.closest('a');
    }

    if (btn) {
        originalContent = btn.innerHTML;
        btn.innerHTML = `<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block"></div> Generating...`;
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.7';
    } else {
        // Fallback for sidebar link if no button context
        document.body.style.cursor = 'wait';
    }

    try {
        const result = await AdminAPI.post('/member/generate-ids', {});
        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: result.message || `Successfully generated IDs for ${result.count} members.`,
                confirmButtonColor: '#3b82f6'
            }).then(() => {
                if (typeof loadMembers === 'function') {
                    loadMembers();
                } else if (typeof loadActiveMembers === 'function') {
                    loadActiveMembers();
                    if (typeof updateCounts === 'function') updateCounts();
                } else {
                    window.location.reload();
                }
            });
        } else {
            throw new Error(result.error || result.message || 'Failed to generate IDs');
        }
    } catch (error) {
        console.error('Generate IDs error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Operation Failed',
            html: `<div class="text-left font-mono text-xs bg-gray-50 p-3 rounded border border-gray-200 mt-2">
                    <div class="font-bold text-red-600 mb-1 italic">DEBUG ERROR:</div>
                    ${error.message}
                   </div>`,
            confirmButtonColor: '#3b82f6'
        });
    } finally {
        if (btn) {
            btn.innerHTML = originalContent;
            btn.style.pointerEvents = '';
            btn.style.opacity = '';
        } else {
            document.body.style.cursor = 'default';
        }
    }
}
window.generateMemberIds = generateMemberIds;

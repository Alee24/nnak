import axios from 'axios';
import Swal from 'sweetalert2';

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor for errors
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.error || error.message || 'An error occurred';

        // Handle Session Expiry
        if (message.includes('Session expired') || message.includes('Authentication required')) {
            // redirect handled by component or router usually, but here we could trigger event
            window.location.href = '/login';
        }

        return Promise.reject(new Error(message));
    }
);

class AdminAPI {
    static async getStats() {
        return api.get('/admin/stats');
    }

    static async getDashboardStats() {
        return api.get('/member/dashboard-stats');
    }

    static async getAnalytics(type) {
        return api.get(`/admin/analytics?type=${type}`);
    }

    static async getMembers(page = 1, search = '', status = '', type = '') {
        try {
            const queryParams = new URLSearchParams({ page, search, status, type }).toString();
            const response = await api.get(`/member?${queryParams}`);
            return response;
        } catch (error) {
            console.error("API Error:", error);
            // Return empty array format if failed to avoid UI crash
            return { members: [], total: 0 };
        }
    }

    static async searchMembers(query) {
        return api.get(`/member/search?q=${query}`);
    }

    static async getPendingCount() {
        return api.get('/member/pending-count');
    }

    static async getPendingApplications(page = 1, limit = 20) {
        return api.get(`/member/applications?page=${page}&limit=${limit}`);
    }

    static async getMemberProfile(id) { // Kept static for consistency with other methods
        try {
            const response = await api.get(`/member/${id}/profile`);
            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    static async getMemberCPD(id) { // Kept static
        try {
            const response = await api.get(`/member/${id}/cpd-points`); // Changed back to /member
            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    static async getMemberPayments(id) { // Kept static
        try {
            const response = await api.get(`/member/${id}/payments`); // Changed back to /member
            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    static async createMember(data) {
        return api.post('/member', data);
    }

    static async updateMember(id, data) {
        return api.put(`/member/${id}`, data);
    }

    static async updateMemberStatus(id, status) {
        return api.put(`/member/${id}/status`, { status });
    }

    static async deleteMember(id) {
        return api.delete(`/member/${id}`);
    }

    // Auth Methods
    static async login(email, password) {
        const response = await api.post('/auth/login', { email, password });
        if (response.success) {
            localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
    }

    static async logout() {
        await api.post('/auth/logout');
        localStorage.removeItem('user');
    }

    // Branding Settings
    static async getSettings() {
        return api.get('/settings');
    }

    static async updateSettings(data) {
        return api.post('/settings', data);
    }

    // Events Methods
    static async getEvents(status = 'all') {
        return api.get(`/event?status=${status}`);
    }

    static async createEvent(formData) {
        // formData should be Multipart/Form-Data if image is included
        return api.post('/event', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    static async updateEvent(id, formData) {
        // formData should be Multipart/Form-Data
        return api.post(`/event/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    static async inviteAllMembers(eventId) {
        return api.post(`/event/${eventId}/invite-all`);
    }

    static async deleteEvent(id) {
        return api.delete(`/event/${id}`);
    }

    // CPD Methods
    static async getCPDLedger() {
        return api.get('/member/cpd-ledger');
    }

    static async awardManualCPD(memberId, data) {
        return api.post(`/member/${memberId}/cpd-points`, data);
    }

    static async getEventAttendees(eventId) {
        return api.get(`/event/${eventId}/attendees`);
    }

    static async updateEventAttendance(eventId, data) {
        return api.post(`/event/${eventId}/attendance`, data);
    }
}

export default AdminAPI;

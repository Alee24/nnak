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
        const errorData = error.response?.data;
        const mainError = errorData?.error || error.message || 'An error occurred';
        const details = errorData?.message ? ` (${errorData.message})` : '';
        const combinedMessage = `${mainError}${details}`;

        // Handle Session Expiry
        if (combinedMessage.includes('Session expired') || combinedMessage.includes('Authentication required')) {
            window.location.href = '/login';
        }

        return Promise.reject(new Error(combinedMessage));
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

    static async verifyMember(id) {
        try {
            // Use the new public verify endpoint
            const response = await api.get(`/member/verify/${id}`);
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

    static async uploadProfilePhoto(formData) {
        return api.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
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
        // Don't store user here if OTP is required
        if (response.success && !response.otp_required) {
            localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
    }

    static async verifyOtp(otp) {
        const response = await api.post('/auth/verify-otp', { otp });
        if (response.success) {
            localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
    }

    static async logout() {
        await api.post('/auth/logout');
        localStorage.removeItem('user');
    }

    // Messaging and Settings
    static async getSettings() {
        return api.get('/settings');
    }

    static async getPublicSettings() {
        return api.get('/settings/public');
    }

    static async updateSettings(data) {
        return api.post('/settings', data);
    }

    // Payment Methods
    static async createPayment(data) {
        return api.post('/payment', data);
    }

    static async capturePaypalOrder(orderId, paymentId) {
        return api.post('/payment/paypal-capture', { order_id: orderId, payment_id: paymentId });
    }

    static async getTransactions(page = 1, limit = 20, status = '', type = '', search = '') {
        const queryParams = new URLSearchParams({ page, limit, status, type, search }).toString();
        return api.get(`/payment/list?${queryParams}`);
    }

    static async getTransaction(id) {
        return api.get(`/payment/${id}`);
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

    // Contact & Messages
    static async submitContactMessage(data) {
        return api.post('/contact/submit', data);
    }

    static async getMessages() {
        return api.get('/contact/messages');
    }

    static async markMessageRead(id) {
        return api.post(`/contact/read/${id}`);
    }

    static async getUnreadMessagesCount() {
        try {
            const response = await api.get('/contact/unread-count');
            return response;
        } catch (error) {
            return { success: false, count: 0 };
        }
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

    static async getMemberDashboardSummary() {
        return api.get('/member/dashboard-summary');
    }

    static async respondToEvent(eventId, response) {
        return api.post(`/event/${eventId}/respond`, { response });
    }

    // Invoice Methods
    static async getInvoices(params = {}) { return api.get('/invoice?' + new URLSearchParams(params).toString()); }
    static async getInvoice(id) { return api.get(`/invoice/${id}`); }
    static async createInvoice(data) { return api.post('/invoice', data); }
    static async updateInvoice(id, data) { return api.put(`/invoice/${id}`, data); }
    static async cancelInvoice(id) { return api.delete(`/invoice/${id}`); }
    static async addInvoiceItem(invoiceId, data) { return api.post(`/invoice/${invoiceId}/items`, data); }
    static async getMemberInvoices(memberId) { return api.get(`/invoice/member/${memberId}`); }
    static async getOverdueInvoices() { return api.get('/invoice/overdue'); }

    // Course Methods
    static async getCourses() { return api.get('/course'); }
    static async getCourse(id) { return api.get(`/course/${id}`); }
    static async createCourse(data) { return api.post('/course', data); }
    static async updateCourse(id, data) { return api.put(`/course/${id}`, data); }
    static async updateCourseStatus(id, status, notes) { return api.put(`/course/${id}/status`, {status, notes}); }
    static async getCourseHoles(id) { return api.get(`/course/${id}/holes`); }
    static async saveCourseHoles(id, holes) { return api.post(`/course/${id}/holes`, {holes}); }

    // Tee Time Methods
    static async getTeeTimes(params = {}) { return api.get('/tee-time?' + new URLSearchParams(params).toString()); }
    static async getTeeTime(id) { return api.get(`/tee-time/${id}`); }
    static async createTeeTime(data) { return api.post('/tee-time', data); }
    static async bookTeeTime(id, data) { return api.post(`/tee-time/${id}/book`, data); }
    static async cancelTeeTime(id) { return api.delete(`/tee-time/${id}`); }
    static async getAvailableTeeTimes(params) { return api.get('/tee-time/available?' + new URLSearchParams(params).toString()); }
    static async getDailyTeeSheet(date, courseId) { return api.get(`/tee-time/daily?date=${date}&course_id=${courseId}`); }
    static async generateTeeSlots(data) { return api.post('/tee-time/generate-slots', data); }
    static async checkInTeePlayer(teeTimeId, playerId) { return api.post(`/tee-time/${teeTimeId}/checkin/${playerId}`); }

    // Guest Methods
    static async getGuests(params = {}) { return api.get('/guest?' + new URLSearchParams(params).toString()); }
    static async getGuest(id) { return api.get(`/guest/${id}`); }
    static async createGuest(data) { return api.post('/guest', data); }
    static async updateGuest(id, data) { return api.put(`/guest/${id}`, data); }
    static async deleteGuest(id) { return api.delete(`/guest/${id}`); }
    static async getTodaysGuests() { return api.get('/guest/today'); }

    // Handicap Methods
    static async getMemberHandicap(memberId) { return api.get(`/handicap/${memberId}`); }
    static async updateHandicap(memberId, data) { return api.put(`/handicap/${memberId}`, data); }
    static async getHandicapHistory(memberId) { return api.get(`/handicap/${memberId}/history`); }
    static async getHandicapDistribution() { return api.get('/handicap/distribution'); }

    // Scorecard Methods
    static async getScorecards(params = {}) { return api.get('/scorecard?' + new URLSearchParams(params).toString()); }
    static async getScorecard(id) { return api.get(`/scorecard/${id}`); }
    static async createScorecard(data) { return api.post('/scorecard', data); }
    static async saveHoleScores(id, entries) { return api.post(`/scorecard/${id}/entries`, {entries}); }
    static async approveScorecard(id) { return api.put(`/scorecard/${id}/approve`); }
    static async rejectScorecard(id, reason) { return api.put(`/scorecard/${id}/reject`, {reason}); }
    static async getMemberScorecards(memberId) { return api.get(`/scorecard/member/${memberId}`); }

    // Competition Methods
    static async getCompetitions(params = {}) { return api.get('/competition?' + new URLSearchParams(params).toString()); }
    static async getCompetition(id) { return api.get(`/competition/${id}`); }
    static async createCompetition(data) { return api.post('/competition', data); }
    static async updateCompetition(id, data) { return api.put(`/competition/${id}`, data); }
    static async updateCompetitionStatus(id, status) { return api.put(`/competition/${id}/status`, {status}); }
    static async registerForCompetition(id, data) { return api.post(`/competition/${id}/register`, data); }
    static async withdrawFromCompetition(id, memberId) { return api.delete(`/competition/${id}/register/${memberId}`); }
    static async getCompetitionRegistrations(id) { return api.get(`/competition/${id}/registrations`); }
    static async getCompetitionLeaderboard(id) { return api.get(`/competition/${id}/leaderboard`); }
    static async getCompetitionTeeSheet(id) { return api.get(`/competition/${id}/tee-sheet`); }
    static async publishCompetitionResults(id) { return api.post(`/competition/${id}/publish-results`); }
    static async getUpcomingCompetitions() { return api.get('/competition/upcoming'); }

    // Check-in Methods
    static async checkIn(data) { return api.post('/check-in', data); }
    static async checkOut(id) { return api.post(`/check-in/${id}/checkout`); }
    static async getTodayCheckIns() { return api.get('/check-in/today'); }
    static async getMembersOnCourse() { return api.get('/check-in/oncourse'); }
    static async getMemberCheckIns(memberId) { return api.get(`/check-in/member/${memberId}`); }

    // Facility Methods
    static async getFacilities() { return api.get('/facility'); }
    static async getFacility(id) { return api.get(`/facility/${id}`); }
    static async createFacility(data) { return api.post('/facility', data); }
    static async updateFacility(id, data) { return api.put(`/facility/${id}`, data); }
    static async checkFacilityAvailability(params) { return api.get('/facility/available?' + new URLSearchParams(params).toString()); }
    static async getFacilityBookings(params = {}) { return api.get('/facility-booking?' + new URLSearchParams(params).toString()); }
    static async createFacilityBooking(data) { return api.post('/facility-booking', data); }
    static async updateFacilityBooking(id, data) { return api.put(`/facility-booking/${id}`, data); }
    static async confirmFacilityBooking(id) { return api.put(`/facility-booking/${id}/confirm`); }
    static async cancelFacilityBooking(id) { return api.delete(`/facility-booking/${id}`); }

    // Finance Methods
    static async getFinanceSummary() { return api.get('/finance/summary'); }
    static async getIncomeStatement(params = {}) { return api.get('/finance/income-statement?' + new URLSearchParams(params).toString()); }
    static async getRevenueByDepartment(params = {}) { return api.get('/finance/revenue-by-department?' + new URLSearchParams(params).toString()); }
    static async getDailySales(params = {}) { return api.get('/finance/daily-sales?' + new URLSearchParams(params).toString()); }
    static async getARaging() { return api.get('/finance/ar-aging'); }
    static async getOutstandingBalances() { return api.get('/finance/outstanding-balances'); }
    static async recordExpense(data) { return api.post('/finance/expense', data); }
    static async getExpenses(params = {}) { return api.get('/finance/expenses?' + new URLSearchParams(params).toString()); }

    // Notification Methods
    static async getNotifications(params = {}) { return api.get('/notification?' + new URLSearchParams(params).toString()); }
    static async getUnreadNotificationCount() { return api.get('/notification/unread-count'); }
    static async markNotificationRead(id) { return api.put(`/notification/${id}/read`); }
    static async markAllNotificationsRead() { return api.put('/notification/read-all'); }
    static async broadcastNotification(data) { return api.post('/notification/broadcast', data); }
    static async sendMemberNotification(data) { return api.post('/notification/send-member', data); }
    static async getNotificationTemplates() { return api.get('/notification/templates'); }
    static async updateNotificationTemplate(id, data) { return api.put(`/notification/templates/${id}`, data); }
    static async triggerMembershipReminders() { return api.post('/notification/membership-reminders'); }

    // Product/Shop Methods
    static async getProducts(params = {}) { return api.get('/product?' + new URLSearchParams(params).toString()); }
    static async getProduct(id) { return api.get(`/product/${id}`); }
    static async createProduct(data) { return api.post('/product', data); }
    static async updateProduct(id, data) { return api.put(`/product/${id}`, data); }
    static async getProductCategories() { return api.get('/product/categories'); }
    static async addStock(productId, data) { return api.post(`/product/${productId}/stock`, data); }
    static async sellProduct(productId, data) { return api.post(`/product/${productId}/sell`, data); }
    static async getLowStockProducts() { return api.get('/product/low-stock'); }

    // Caddy Methods
    static async getCaddies(params = {}) { return api.get('/caddy?' + new URLSearchParams(params).toString()); }
    static async getCaddy(id) { return api.get(`/caddy/${id}`); }
    static async createCaddy(data) { return api.post('/caddy', data); }
    static async updateCaddy(id, data) { return api.put(`/caddy/${id}`, data); }
    static async getAvailableCaddies(date) { return api.get(`/caddy/available?date=${date}`); }
    static async assignCaddy(caddyId, data) { return api.post(`/caddy/${caddyId}/assign`, data); }

    // Golf Cart Methods
    static async getGolfCarts(params = {}) { return api.get('/golf-cart?' + new URLSearchParams(params).toString()); }
    static async getGolfCart(id) { return api.get(`/golf-cart/${id}`); }
    static async createGolfCart(data) { return api.post('/golf-cart', data); }
    static async updateGolfCart(id, data) { return api.put(`/golf-cart/${id}`, data); }
    static async bookGolfCart(id, data) { return api.post(`/golf-cart/${id}/book`, data); }
    static async returnGolfCart(id, data) { return api.put(`/golf-cart/${id}/return`, data); }
    static async getAvailableGolfCarts(date) { return api.get(`/golf-cart/available?date=${date}`); }

    // Supplier/PO Methods
    static async getSuppliers(params = {}) { return api.get('/supplier?' + new URLSearchParams(params).toString()); }
    static async getSupplier(id) { return api.get(`/supplier/${id}`); }
    static async createSupplier(data) { return api.post('/supplier', data); }
    static async updateSupplier(id, data) { return api.put(`/supplier/${id}`, data); }
    static async getPurchaseOrders(params = {}) { return api.get('/purchase-order?' + new URLSearchParams(params).toString()); }
    static async getPurchaseOrder(id) { return api.get(`/purchase-order/${id}`); }
    static async createPurchaseOrder(data) { return api.post('/purchase-order', data); }
    static async approvePurchaseOrder(id) { return api.put(`/purchase-order/${id}/approve`); }
    static async receivePurchaseOrder(id, data) { return api.put(`/purchase-order/${id}/receive`, data); }

    // Staff Methods
    static async getStaff(params = {}) { return api.get('/staff?' + new URLSearchParams(params).toString()); }
    static async getStaffMember(id) { return api.get(`/staff/${id}`); }
    static async createStaff(data) { return api.post('/staff', data); }
    static async updateStaff(id, data) { return api.put(`/staff/${id}`, data); }

    // Maintenance Methods
    static async getMaintenanceTasks(params = {}) { return api.get('/maintenance?' + new URLSearchParams(params).toString()); }
    static async getMaintenanceTask(id) { return api.get(`/maintenance/${id}`); }
    static async createMaintenanceTask(data) { return api.post('/maintenance', data); }
    static async updateMaintenanceTask(id, data) { return api.put(`/maintenance/${id}`, data); }
    static async completeMaintenanceTask(id, data) { return api.put(`/maintenance/${id}/complete`, data); }
    static async getOverdueMaintenance() { return api.get('/maintenance/overdue'); }

    // Asset Methods
    static async getAssets(params = {}) { return api.get('/asset?' + new URLSearchParams(params).toString()); }
    static async getAsset(id) { return api.get(`/asset/${id}`); }
    static async createAsset(data) { return api.post('/asset', data); }
    static async updateAsset(id, data) { return api.put(`/asset/${id}`, data); }
    static async addAssetMaintenance(assetId, data) { return api.post(`/asset/${assetId}/maintenance`, data); }

    // Dependant Methods
    static async getDependants(memberId) { return api.get(`/dependants/${memberId}`); }
    static async addDependant(memberId, data) { return api.post(`/dependants/${memberId}`, data); }
    static async updateDependant(memberId, dependantId, data) { return api.put(`/dependants/${memberId}/${dependantId}`, data); }
    static async deleteDependant(memberId, dependantId) { return api.delete(`/dependants/${memberId}/${dependantId}`); }

    // Audit Methods
    static async getAuditLogs(params = {}) { return api.get('/audit?' + new URLSearchParams(params).toString()); }

    // Restaurant Methods
    static async getRestaurantTables() { return api.get('/restaurant/tables'); }
    static async updateTableStatus(id, status) { return api.put(`/restaurant/tables/${id}/status`, {status}); }
    static async getRestaurantOrders(params = {}) { return api.get('/restaurant/orders?' + new URLSearchParams(params).toString()); }
    static async createRestaurantOrder(data) { return api.post('/restaurant/orders', data); }
    static async updateOrderStatus(id, status) { return api.put(`/restaurant/orders/${id}/status`, {status}); }
    static async addOrderItems(orderId, items) { return api.post(`/restaurant/orders/${orderId}/items`, {items}); }
    static async payRestaurantOrder(orderId, data) { return api.post(`/restaurant/orders/${orderId}/pay`, data); }
    static async getDailySalesRestaurant(date) { return api.get(`/restaurant/daily-sales?date=${date}`); }
    static async getRestaurantMenu() { return api.get('/restaurant/menu'); }
}

export default AdminAPI;

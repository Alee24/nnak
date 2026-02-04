// API Base URL
const API_URL = 'http://localhost:8000/index.php?request=api';

// API Client
class API {
    static async request(endpoint, options = {}) {
        const url = `${API_URL}/${endpoint}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const config = {
            credentials: 'include', // CRITICAL: Send and receive cookies for PHP sessions
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            signal: controller.signal,
            ...options
        };

        try {
            const response = await fetch(url, config);
            clearTimeout(timeoutId);

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server returned non-JSON response. Possibly a PHP error.");
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed with status ' + response.status);
            }

            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('API Error:', error);
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please check your internet connection.');
            }
            throw error;
        }
    }

    static get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    static post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    static put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    static delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Auth Service
class AuthService {
    static async login(email, password) {
        const data = await API.post('auth/login', { email, password });
        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            return data.user;
        }
        throw new Error(data.error);
    }

    static async register(userData) {
        const data = await API.post('auth/register', userData);
        return data;
    }

    static async logout() {
        await API.post('auth/logout');
        localStorage.removeItem('user');
        window.location.href = 'http://localhost:6856/pages/login.html';
    }

    static async getProfile() {
        const data = await API.get('auth/profile');
        if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
            return data.user;
        }
        return null;
    }

    static getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    static isAuthenticated() {
        return !!this.getCurrentUser();
    }

    static isAdmin() {
        const user = this.getCurrentUser();
        return user && (user.role === 'admin' || user.role === 'super_admin');
    }
}

// Notification System
class Notification {
    static show(message, type = 'info') {
        const container = this.getContainer();
        const notification = document.createElement('div');
        notification.className = `alert alert-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            min-width: 300px;
            max-width: 500px;
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;

        container.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    static success(message) {
        this.show(message, 'success');
    }

    static error(message) {
        this.show(message, 'error');
    }

    static warning(message) {
        this.show(message, 'warning');
    }

    static info(message) {
        this.show(message, 'info');
    }

    static getContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            document.body.appendChild(container);
        }
        return container;
    }
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Form Validation
class FormValidator {
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePhone(phone) {
        const re = /^[\d\s\-\+\(\)]+$/;
        return phone.length >= 10 && re.test(phone);
    }

    static validatePassword(password) {
        return password.length >= 6;
    }

    static showError(input, message) {
        const formGroup = input.closest('.form-group');
        let error = formGroup.querySelector('.form-error');

        if (!error) {
            error = document.createElement('span');
            error.className = 'form-error';
            formGroup.appendChild(error);
        }

        error.textContent = message;
        input.style.borderColor = 'var(--error)';
    }

    static clearError(input) {
        const formGroup = input.closest('.form-group');
        const error = formGroup.querySelector('.form-error');

        if (error) {
            error.remove();
        }

        input.style.borderColor = '';
    }
}

// Loading Overlay
class LoadingOverlay {
    static show() {
        let overlay = document.getElementById('loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `;
            overlay.innerHTML = '<div class="spinner"></div>';
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
    }

    static hide() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
}

// Format Date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format Currency
function formatCurrency(amount, currency = 'KES') {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Check Auth on Protected Pages
function requireAuth() {
    if (!AuthService.isAuthenticated()) {
        window.location.href = 'http://localhost:6856/pages/login.html';
        return false;
    }
    return true;
}

// Check Admin on Admin Pages
function requireAdmin() {
    if (!AuthService.isAdmin()) {
        Notification.error('Admin access required');
        window.location.href = 'http://localhost:6856/pages/dashboard.html';
        return false;
    }
    return true;
}

// Export for use in other files
window.API = API;
window.AuthService = AuthService;
window.Notification = Notification;
window.FormValidator = FormValidator;
window.LoadingOverlay = LoadingOverlay;
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;
window.requireAuth = requireAuth;
window.requireAdmin = requireAdmin;

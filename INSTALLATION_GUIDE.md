# NNAK System Installation Guide

This guide provides step-by-step instructions for setting up the NNAK Membership Management System on a local development environment or a VPS.

## 📋 Prerequisites

Before starting, ensure you have the following installed:
- **PHP 7.4 or higher**
- **MySQL 5.7+ or MariaDB**
- **Apache Server** (with `mod_rewrite` enabled)
- **Node.js 16.x or higher** (plus `npm`)
- **Git**

## 🛠️ Setup Steps

### 1. Clone & Directory Setup
Ensure the project is in your web server's root directory (e.g., `C:\xampp\htdocs\NNAK` or `/var/www/html/NNAK`).

### 2. Environment Configuration
Copy the `.env.example` file to `.env` and update your database credentials.
```bash
cp .env.example .env
```

**Key `.env` variables:**
- `DB_NAME`: nnak_system
- `APP_URL`: http://localhost:4549
- `JWT_SECRET`: change_this_in_production

### 3. Database Setup
1. Create a MySQL database:
   ```sql
   CREATE DATABASE nnak_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Run the migrations to create tables and seed demo data:
   ```bash
   php backend/run_migrations.php
   ```

### 4. Backend Dependencies & Startup
The backend runs using a basic PHP server or Apache.
- **Port:** 4549 (default)
- To start the backend manually:
  ```bash
  php -S 0.0.0.0:4549 backend/server_router.php
  ```

### 5. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server (configured for port 4875):
   ```bash
   npm run dev
   ```

## 🌐 Network Access
If you are running this on a network or VPS:
- Frontend runs on: `http://localhost:4875`
- Backend API runs on: `http://localhost:4549`

Ensure these ports are open in your firewall.

## 🔧 Common Commands

- **Reset Admin Password**: `php backend/reset_admin_password.php`
- **Seed Transactions**: `php backend/seed_transactions.php`
- **Clean DB**: `php backend/cleanup_db.php`

## 📁 Troubleshooting
- **Apache Errors**: Ensure `.htaccess` in the root and `/backend` are correctly configured.
- **Vite Build**: If encountering 'oklch' errors during PDF export, ensure all Tailwind variables are correctly stripped as implemented in `MemberProfile.jsx`.

---
Last Updated: February 2026

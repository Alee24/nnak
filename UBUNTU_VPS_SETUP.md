# Ubuntu VPS Installation Guide: NNAK System

Follow these commands step-by-step to deploy the NNAK Membership Management System on a clean Ubuntu VPS (20.04 or 22.04).

## 1. System Update & Dependencies
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget unzip build-essential
```

## 2. Install LAMP Stack (Apache, MySQL, PHP)
```bash
# Install Apache
sudo apt install -y apache2
sudo systemctl enable apache2
sudo systemctl start apache2

# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Install PHP & Extensions
sudo apt install -y php php-mysql php-curl php-json php-gd php-mbstring php-xml php-zip libapache2-mod-php
```

## 3. Enable Apache mod_rewrite (Crucial for API)
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

## 4. Install Node.js & NPM (via NVM)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

## 5. Clone Project & Permissions
```bash
cd /var/www/html
sudo git clone https://github.com/Alee24/nnak.git
sudo chown -R $USER:$USER /var/www/html/nnak
cd nnak
```

## 6. Configure Environment
```bash
cp .env.example .env
nano .env
```
*Update `DB_NAME`, `DB_USER`, `DB_PASS`, and change `http://localhost` to your VPS IP or Domain.*

## 7. Database Setup
```bash
# Create Database
sudo mysql -u root -p -e "CREATE DATABASE nnak_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run Migrations
php backend/run_migrations.php
```

## 8. Frontend Installation
```bash
cd frontend
npm install
npm run build
```

## 9. Set Up PM2 for Continuous Running (Optional but Recommended)
```bash
npm install -g pm2

# Run Backend (if using PHP built-in server for certain paths)
pm2 start "php -S 0.0.0.0:4549 ../backend/server_router.php" --name nnak-api

# Run Frontend Dev Server (or serve static build with Nginx/Apache)
pm2 start "npm run dev -- --host --port 4875" --name nnak-frontend
```

## 10. Firewall Configuration
```bash
sudo ufw allow 80/tcp
sudo ufw allow 4875/tcp
sudo ufw allow 4549/tcp
sudo ufw enable
```

---
**Verification**: Visit `http://your-vps-ip:4875` to access the system.

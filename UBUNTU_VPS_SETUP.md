# Ubuntu VPS Installation Guide: NNAK System ('/var/www/nnak.kkdes.co.ke')

Since your project is located at `/var/www/nnak.kkdes.co.ke`, use these exact commands to update and fix the live server.

## 1. Fix Database Schema & Seed Accounts
Crucial to make the "Registration" flow work (adds missing `profile_picture` column).

```bash
# FIX: Trust the directory (Run this first!)
git config --global --add safe.directory /var/www/nnak.kkdes.co.ke

cd /var/www/nnak.kkdes.co.ke
sudo git pull origin main

# Apply Master Schema
sudo mysql -u root -p nnak_system < backend/MASTER_SCHEMA.sql

# Seed Admin & Test Accounts
sudo mysql -u root -p nnak_system < backend/seed_accounts.sql
```

## 2. Rebuild Frontend
Ensures the latest React code is compiled.

```bash
cd frontend
npm install
npm run build
```

## 3. Configure Apache (Copy & Paste All)
This configures Apache to serve the React app and route API requests.

```bash
sudo bash -c 'cat > /etc/apache2/sites-available/nnak.conf <<EOF
<VirtualHost *:80>
    ServerName nnak.kkdes.co.ke
    ServerAlias 185.192.97.84
    DocumentRoot /var/www/nnak.kkdes.co.ke/frontend/dist

    <Directory /var/www/nnak.kkdes.co.ke/frontend/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^ index.html [QSA,L]
    </Directory>

    Alias /api /var/www/nnak.kkdes.co.ke/backend
    <Directory /var/www/nnak.kkdes.co.ke/backend>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^(.*)$ index.php?request=$1 [QSA,L]
    </Directory>

    ErrorLog \${APACHE_LOG_DIR}/nnak_error.log
    CustomLog \${APACHE_LOG_DIR}/nnak_access.log combined
</VirtualHost>
EOF'

# Enable & Restart
sudo a2ensite nnak.conf
sudo a2enmod rewrite
sudo systemctl restart apache2
```

## 4. Verification
1.  **URL**: Visit `http://185.192.97.84` or `http://nnak.kkdes.co.ke`
2.  **Login**: `admin@nnak.org` / `Digital2025`
3.  **Register**: Try creating a new account (should work now).

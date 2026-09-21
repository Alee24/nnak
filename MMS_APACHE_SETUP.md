# MMS Golf Club Management System — Apache Installation Guide
**Domain:** `mms.kkdes.co.ke`

---

## ⚡ Quick One-Line Automated Installation

Run this single command on your Ubuntu VPS (from your project folder, e.g., `/var/www/nnak.kkdes.co.ke` or `/var/www/mms.kkdes.co.ke`):

```bash
chmod +x mms_apache_setup.sh && sudo bash mms_apache_setup.sh
```

---

## 🛠️ Step-by-Step Manual Commands (Combined Sequence)

If you prefer to run the commands directly in your terminal:

```bash
git fetch origin && \
git checkout MMS && \
git reset --hard origin/MMS && \
git pull origin MMS && \
cd frontend && npm install --legacy-peer-deps && npm run build && cd .. && \
mkdir -p backend/uploads/profiles backend/uploads/events backend/uploads/documents && \
chmod -R 775 backend/uploads && \
php backend/run_migrations.php && \
php backend/migrations/015_gcms_seed_data.php && \
sudo bash -c "cat > /etc/apache2/sites-available/mms.conf <<EOF
<VirtualHost *:80>
    ServerName mms.kkdes.co.ke
    ServerAlias www.mms.kkdes.co.ke
    DocumentRoot $(pwd)/frontend/dist

    <Directory $(pwd)/frontend/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^ index.html [QSA,L]
    </Directory>

    Alias /api $(pwd)/backend
    <Directory $(pwd)/backend>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^(.*)$ index.php?request=\\\$1 [QSA,L]
    </Directory>

    Alias /uploads $(pwd)/backend/uploads
    <Directory $(pwd)/backend/uploads>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    ErrorLog \\\${APACHE_LOG_DIR}/mms_error.log
    CustomLog \\\${APACHE_LOG_DIR}/mms_access.log combined
</VirtualHost>
EOF" && \
sudo a2enmod rewrite headers && \
sudo a2ensite mms.conf && \
sudo systemctl restart apache2
```

---

## 🌐 Verification

1. **URL**: Visit `http://mms.kkdes.co.ke`
2. **Default Admin Login**:
   - **Email**: `gm@mmsgolfclub.co.ke` or `admin@nnak.org`
   - **Password**: `Digital2025`
   - **OTP (if prompted)**: `2424`

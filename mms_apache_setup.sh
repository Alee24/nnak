#!/bin/bash
# ==============================================================================
# MMS Golf Club Management System - Automated Apache & System Setup Script
# Domain: mms.kkdes.co.ke
# ==============================================================================

set -e

echo "=========================================================="
echo "🚀 Starting MMS Setup for Domain: mms.kkdes.co.ke"
echo "=========================================================="

PROJECT_DIR=$(pwd)
echo "📍 Current Project Directory: $PROJECT_DIR"

# 1. Ensure Safe Directory for Git
git config --global --add safe.directory "$PROJECT_DIR" || true

# 2. Update to MMS Branch
echo "📦 Pulling latest changes from MMS branch..."
git fetch origin
git checkout MMS
git reset --hard origin/MMS
git pull origin MMS

# 3. Build React Frontend
echo "⚛️  Building React Production Bundle..."
cd "$PROJECT_DIR/frontend"
npm install --legacy-peer-deps
npm run build
cd "$PROJECT_DIR"

# 4. Set Permissions
echo "🔒 Setting File & Directory Permissions..."
mkdir -p "$PROJECT_DIR/backend/uploads/profiles"
mkdir -p "$PROJECT_DIR/backend/uploads/events"
mkdir -p "$PROJECT_DIR/backend/uploads/documents"
chmod -R 775 "$PROJECT_DIR/backend/uploads"
chown -R www-data:www-data "$PROJECT_DIR" 2>/dev/null || true

# 5. Execute Database Migrations & Seed Data
echo "🗄️  Applying Database Migrations & Seed Data..."
php "$PROJECT_DIR/backend/run_migrations.php" || true
php "$PROJECT_DIR/backend/migrations/015_gcms_seed_data.php" || true

# 6. Configure Apache VirtualHost
echo "🌐 Configuring Apache VirtualHost for mms.kkdes.co.ke..."
cat <<EOF > /etc/apache2/sites-available/mms.conf
<VirtualHost *:80>
    ServerName mms.kkdes.co.ke
    ServerAlias www.mms.kkdes.co.ke
    DocumentRoot $PROJECT_DIR/frontend/dist

    <Directory $PROJECT_DIR/frontend/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^ index.html [QSA,L]
    </Directory>

    Alias /api $PROJECT_DIR/backend
    <Directory $PROJECT_DIR/backend>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^(.*)$ index.php?request=\$1 [QSA,L]
    </Directory>

    Alias /uploads $PROJECT_DIR/backend/uploads
    <Directory $PROJECT_DIR/backend/uploads>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    ErrorLog \${APACHE_LOG_DIR}/mms_error.log
    CustomLog \${APACHE_LOG_DIR}/mms_access.log combined
</VirtualHost>
EOF

# 7. Enable Site & Apache Modules
echo "🔄 Enabling Apache Modules and Site..."
a2enmod rewrite headers
a2ensite mms.conf
systemctl restart apache2

echo "=========================================================="
echo "✅ MMS Installation & Apache Configuration Complete!"
echo "🌐 URL: http://mms.kkdes.co.ke"
echo "=========================================================="

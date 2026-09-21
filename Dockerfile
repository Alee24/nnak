FROM php:8.2-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    mysql-client \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    zip \
    libzip-dev \
    unzip \
    curl \
    git

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_mysql \
        gd \
        zip \
        opcache \
        bcmath

# PHP configuration
COPY docker/php.ini /usr/local/etc/php/conf.d/mms.ini

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY backend/ /var/www/html/backend/
COPY .env /var/www/html/.env
COPY server_router.php /var/www/html/server_router.php

# Create uploads directory
RUN mkdir -p /var/www/html/backend/uploads/profiles \
             /var/www/html/backend/uploads/events \
             /var/www/html/backend/uploads/documents \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 775 /var/www/html/backend/uploads

EXPOSE 9000

CMD ["php-fpm"]

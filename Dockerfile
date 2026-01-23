FROM php:8.2-fpm

# ========================
# System dependencies
# ========================
RUN apt-get update && apt-get install -y \
    unzip \
    git \
    curl \
    libzip-dev \
    libicu-dev \
    zip \
    gnupg \
    ca-certificates \
    && docker-php-ext-configure zip \
    && docker-php-ext-install zip intl pdo_mysql

# ========================
# Install Composer
# ========================
RUN curl -sS https://getcomposer.org/installer | php \
    -- --install-dir=/usr/local/bin --filename=composer

# ========================
# Install Node.js (v22)
# ========================
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm

# ========================
# Cleanup
# ========================
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

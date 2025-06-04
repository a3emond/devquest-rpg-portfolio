# Base image
FROM php:8.3-apache

# Install Composer and common extensions
RUN apt-get update && apt-get install -y \
    unzip \
    curl \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
 && docker-php-ext-install \
    zip \
    mbstring \
    pdo \
    pdo_mysql \
 && docker-php-ext-enable pdo_mysql \
 && curl -sS https://getcomposer.org/installer | php \
 && mv composer.phar /usr/local/bin/composer \
 && a2enmod rewrite headers ssl \
 && rm -rf /var/lib/apt/lists/*

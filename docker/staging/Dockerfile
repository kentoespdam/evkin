FROM php:8.4-alpine AS build

ENV APP_NAME="EvKin"

WORKDIR /var/www/html

# Install system dependencies for build
RUN apk add --no-cache \
    git \
    unzip \
    nodejs \
    npm \
    libpng-dev \
    libxml2-dev \
    libzip-dev \
    oniguruma-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    icu-dev \
    sqlite-dev

# Install PHP extensions required for composer install / artisan
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    pdo_sqlite \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    opcache \
    intl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application code
COPY . .
# Ensure .env exists for artisan (copy example if needed, or expect .env from context if not gitignored)
# We safely copy example to .env just for the build process
RUN cp docker/staging/.env.staging .env

# Install PHP dependencies
RUN rm -rf storage bootstrap/cache
RUN mkdir -p storage/framework/views storage/framework/cache \
    storage/framework/sessions storage/framework/testing bootstrap/cache \
    && chmod -R 777 storage bootstrap/cache
RUN composer install --no-dev --optimize-autoloader
RUN php artisan optimize:clear
RUN php artisan optimize
RUN php artisan config:cache
RUN php artisan route:cache
RUN php artisan view:cache

# Install Node dependencies & Build
RUN npm ci
RUN npm run build

# --- Runtime Stage ---
FROM php:8.4-fpm-alpine AS runner

# Install system dependencies
RUN apk add --no-cache \
    zip \
    unzip \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    libzip-dev \
    oniguruma-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    icu-dev

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    opcache \
    intl

# Install Composer (for runtime if needed, though we copied vendor)
# COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

FROM runner AS runtime
WORKDIR /var/www/html

# Copy application code from build stage (including vendor and public/build)
COPY --from=build /var/www/html /var/www/html

RUN rm -rf /var/www/html/config
RUN rm -rf /var/www/html/database
RUN rm -rf /var/www/html/routes
RUN rm -rf /var/www/html/tests
RUN rm -rf /var/www/html/resources/css
RUN rm -rf /var/www/html/resources/js
RUN rm -rf /var/www/html/.ediitorconfig .env \
    .env.example .prettierignore .prettierrc GEMINI.md \
    components.json eslint.config.js Makefile README.md \
    artisan boost.json composer.json composer.lock \
    package.json package-lock.json phpunit.xml \
    tsconfig.json vite.config.ts

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

CMD ["php-fpm"]

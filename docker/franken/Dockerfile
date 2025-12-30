# TAHAP 1: Unified Builder (Debian + PHP 8.4 + Node 22)
FROM dunglas/frankenphp:php8.4.1-bookworm AS base

# 1. Install system dependencies & Node.js (Metode Debian)
RUN install-php-extensions pdo_mysql gd zip opcache pcntl intl bcmath

FROM composer:2 AS builder
# 3. Setup Composer
# COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# 4. Copy file dependensi (untuk caching layer)
COPY composer.json composer.lock package.json package-lock.json ./

# 5. Install dependensi (PENTING: gunakan --ignore-platform-reqs agar tidak error versi) [2]
RUN composer install --no-dev --no-scripts --ignore-platform-reqs

# 6. Salin seluruh kode program
COPY . .

# 7. PERBAIKAN WAYFINDER: Buat folder framework agar Laravel bisa booting
RUN mkdir -p storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/framework/testing \
    bootstrap/cache
RUN chown -R www-data:www-data storage bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

RUN composer dump-autoload --optimize --ignore-platform-reqs


# TAHAP 2: Final Production Runner (Tanpa Node.js)
FROM base AS runner

# Install ekstensi runtime saja
WORKDIR /app

# Salin seluruh folder aplikasi dari builder
COPY --from=builder /app /app
COPY docker/franken/.env.staging .env

# Atur Environment & Permission [3]
ENV APP_ENV=production
ENV APP_DEBUG=false

RUN mv Caddyfile /etc/caddy/Caddyfile
RUN frankenphp fmt --overwrite /etc/caddy/Caddyfile

RUN chown -R www-data:www-data storage bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

# Jalankan optimasi Laravel 12 [1]
RUN php artisan optimize:clear
RUN php artisan route:cache
RUN php artisan event:cache
RUN php artisan view:cache

# ============================================================
# SCRIPT PEMBERSIHAN FILE PRODUKSI
# ============================================================
# Hapus file mentah untuk menghemat ukuran image
RUN rm -rf node_modules resources/js tests /root/.npm /root/.composer \
    .github .git .vscode docker .dockerignore .editorconfig .env.example \
    .prettierrc ..prettierignore components.json eslint.config.js Makefile boost.json package.json package-lock.json \
    tsconfig.json vite.config.ts

EXPOSE 80

ENTRYPOINT ["php", "artisan", "octane:frankenphp"]
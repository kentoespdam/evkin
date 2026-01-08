# syntax=docker/dockerfile:1

############################
# Stage 1: Builder (Composer + Node + PHP CLI)
############################
FROM ubuntu:24.04 AS builder
WORKDIR /app

ARG TZ=UTC
ENV DEBIAN_FRONTEND=noninteractive \
    TZ=${TZ} \
    APP_ENV=production \
    APP_DEBUG=false \
    APP_KEY=base64:abcdefghijklmnopqrstuvwxyz0123456789abcd==

# Install PHP CLI, Composer, and Node.js
RUN ln -snf /usr/share/zoneinfo/${TZ} /etc/localtime \
    && echo ${TZ} > /etc/timezone
RUN apt-get update && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends curl gnupg ca-certificates curl \
    && curl -sS 'https://keyserver.ubuntu.com/pks/lookup?op=get&search=0xb8dc7e53946656efbce4c1dd71daeaab4ad4cab6' | gpg --dearmor | tee /etc/apt/keyrings/ppa_ondrej_php.gpg > /dev/null \
    && echo "deb [signed-by=/etc/apt/keyrings/ppa_ondrej_php.gpg] https://ppa.launchpadcontent.net/ondrej/php/ubuntu noble main" > /etc/apt/sources.list.d/ppa_ondrej_php.list \
    && mkdir -p /etc/apt/keyrings \
    && apt-get update \
    && apt-get install -y --no-install-recommends git unzip php8.5-cli php8.5-mbstring php8.5-xml php8.5-curl php8.5-zip
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" > /etc/apt/sources.list.d/nodesource.list
RUN apt-get update \
    && apt-get install -y --no-install-recommends nodejs
RUN curl -sLS https://getcomposer.org/installer | php -- --install-dir=/usr/bin/ --filename=composer \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copy full application into builder (composer scripts may need app files)
COPY . .

# Ensure a minimal .env exists if not provided
RUN [ -f .env ] || cp .env.example .env || true

# Install PHP dependencies; npm-related steps (if any) run via composer scripts
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-progress \
    --optimize-autoloader \
    --classmap-authoritative \
    && php artisan key:generate \
    # && php artisan migrate --force \
    && npm ci
RUN npm run build
RUN composer clear-cache \
    && rm -rf /root/.composer/cache \
    && find . -type d -name '.git' -exec rm -rf {} + 2>/dev/null || true \
    && rm -rf node_modules/.cache

############################
# Stage 3: Runtime (FrankenPHP + Octane)
############################
FROM dunglas/frankenphp:php8.5-alpine AS runner

# Install only required PHP extensions for Laravel + Octane + MySQL + Redis
RUN install-php-extensions \
    bcmath \
    intl \
    pdo_mysql \
    redis \
    pcntl \
    posix \
    zip \
    opcache \
    && rm -rf /tmp/* /var/cache/apk/*

WORKDIR /var/www/html

# Copy only necessary application files from builder to minimize final image size
COPY --from=builder /app/app /var/www/html/app
COPY --from=builder /app/bootstrap /var/www/html/bootstrap
COPY --from=builder /app/config /var/www/html/config
COPY --from=builder /app/public /var/www/html/public
COPY --from=builder /app/routes /var/www/html/routes
COPY --from=builder /app/resources/views /var/www/html/resources/views
COPY --from=builder /app/artisan /var/www/html/artisan
COPY --from=builder /app/composer.json /var/www/html/composer.json
COPY --from=builder /app/composer.lock /var/www/html/composer.lock
RUN rm -rf /var/www/html/resources/js

# Bring in Composer vendor from builder stage
COPY --from=builder /app/vendor /var/www/html/vendor

# Bring in built frontend assets (produced by composer scripts if configured)
COPY --from=builder /app/public/build /var/www/html/public/build

# PHP runtime ini (CLI/SAPI)
COPY docker/production/php.ini /usr/local/etc/php/conf.d/99-custom.ini
COPY docker/production/entrypoint.sh /usr/local/bin/entrypoint

# Create storage structure and set permissions
RUN chmod +x /usr/local/bin/entrypoint \
    && mkdir -p /var/www/html/storage/framework/{cache,sessions,testing,views} \
    && mkdir -p /var/www/html/storage/{app,logs} \
    && mkdir -p /var/www/html/bootstrap/cache \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80

# Start via entrypoint to warm caches then start FrankenPHP Octane server
ENTRYPOINT ["entrypoint"]

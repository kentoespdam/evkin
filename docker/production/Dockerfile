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
    && apt-get install -y gnupg gosu curl ca-certificates zip unzip git supervisor sqlite3 libcap2-bin libpng-dev python3 dnsutils librsvg2-bin fswatch ffmpeg nano  \
    && curl -sS 'https://keyserver.ubuntu.com/pks/lookup?op=get&search=0xb8dc7e53946656efbce4c1dd71daeaab4ad4cab6' | gpg --dearmor | tee /etc/apt/keyrings/ppa_ondrej_php.gpg > /dev/null \
    && echo "deb [signed-by=/etc/apt/keyrings/ppa_ondrej_php.gpg] https://ppa.launchpadcontent.net/ondrej/php/ubuntu noble main" > /etc/apt/sources.list.d/ppa_ondrej_php.list \
    && apt-get update \
    && apt-get install -y \
        libgd3 \
        php8.5-cli \
        php8.5-dev \
        php8.5-pgsql \
        php8.5-sqlite3 \
        php8.5-gd \
        php8.5-curl \
        php8.5-mongodb \
        php8.5-imap \
        php8.5-mysql \
        php8.5-mbstring \
        php8.5-xml \
        php8.5-zip \
        php8.5-bcmath \
        php8.5-soap \
        php8.5-intl \
        php8.5-readline \
        php8.5-ldap \
        php8.5-msgpack \
        php8.5-igbinary \
        php8.5-redis \
        #php8.5-swoole \
        php8.5-memcached \
        php8.5-pcov \
        php8.5-imagick \
        php8.5-xdebug
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" > /etc/apt/sources.list.d/nodesource.list
RUN apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    && npm install -g npm@latest
RUN curl -sLS https://getcomposer.org/installer | php -- --install-dir=/usr/bin/ --filename=composer \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copy full application into builder (composer scripts may need app files)
COPY . .

# Ensure a minimal .env exists if not provided
RUN cp .env.example .env

# Install PHP dependencies; npm-related steps (if any) run via composer scripts
# RUN composer install \
#     --no-dev \
#     --prefer-dist \
#     --no-interaction \
#     --no-progress \
#     --optimize-autoloader \
#     --classmap-authoritative
# RUN npm install && npm run build || true
RUN composer setup
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
COPY --from=builder /app/resources /var/www/html/resources
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
    && mkdir -p /var/www/html/storage/framework/cache \
    && mkdir -p /var/www/html/storage/framework/sessions \
    && mkdir -p /var/www/html/storage/framework/testing \
    && mkdir -p /var/www/html/storage/framework/views \
    && mkdir -p /var/www/html/storage/app \
    && mkdir -p /var/www/html/storage/logs \
    && mkdir -p /var/www/html/bootstrap/cache \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/public \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/public

EXPOSE 80

# Start via entrypoint to warm caches then start FrankenPHP Octane server
ENTRYPOINT ["entrypoint"]
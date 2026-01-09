#!/usr/bin/env sh
set -e

cd /var/www/html

# Ensure writable directories exist
mkdir -p storage/framework/cache || true
mkdir -p storage/framework/data || true
mkdir -p storage/framework/sessions || true
mkdir -p storage/framework/testing || true
mkdir -p storage/framework/views || true
mkdir -p storage/app || true
mkdir -p storage/logs || true
mkdir -p bootstrap/cache || true
chown -R www-data:www-data storage bootstrap/cache || true
chmod -R 775 storage bootstrap/cache || true

# Warm caches only when app key is present (typical in production)
if [ -n "$APP_KEY" ]; then
  php artisan config:cache || true
  php artisan route:cache || true
  php artisan view:cache || true
  php artisan event:cache || true
  php artisan storage:link || true
fi

# Start FrankenPHP via Octane (bind to port 80)
exec php artisan octane:frankenphp --host=0.0.0.0 --port=${PORT:-80} --workers=${WORKERS:-auto} --max-requests=${MAX_REQUESTS:-500}
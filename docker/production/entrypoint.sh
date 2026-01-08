#!/usr/bin/env sh
set -e

cd /var/www/html

# Ensure writable directories exist
mkdir -p storage/framework/{cache,data,sessions,testing,views} bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache || true
chmod -R 775 storage bootstrap/cache || true

# Warm caches only when app key is present (typical in production)
if [ -n "$APP_KEY" ]; then
  php artisan optimize:clear || true
  # php artisan config:cache || true
  php artisan route:cache || true
  php artisan view:cache || true
  # php artisan event:cache || true
  # php artisan storage:link || true
fi

frankenphp fmt --overwrite /etc/caddy/Caddyfile
# Start FrankenPHP via Octane (bind to port 80)
exec php artisan octane:frankenphp --host=0.0.0.0 --port=${PORT:-80} --workers=${WORKERS:-auto} --max-requests=${MAX_REQUESTS:-500}

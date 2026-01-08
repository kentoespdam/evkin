# Laravel Production Docker Setup

Production-optimized Docker configuration for Laravel 12 + Inertia + React (CSR) using FrankenPHP and Octane.

## Image Size Optimizations

This setup achieves a minimal production image size through:

### 1. Alpine-Based Runtime (~200MB base)
- Uses `dunglas/frankenphp:php8.5-alpine` instead of Debian/Ubuntu (~500MB)
- Significantly reduces the final image size

### 2. Multi-Stage Build
- **Builder Stage**: Contains all build tools (Node.js, Composer, PHP CLI)
- **Runtime Stage**: Only contains the final application and runtime dependencies
- Build artifacts are selectively copied, excluding dev tools

### 3. .dockerignore
- Excludes unnecessary files from build context:
  - Git files, node_modules, tests, documentation
  - Reduces build context and prevents unnecessary file copies

### 4. Selective File Copying
Runtime image includes only:
- `app/` - Application code
- `bootstrap/` - Framework bootstrap
- `config/` - Configuration
- `public/` - Web root and built assets
- `routes/` - Route definitions
- `resources/views/` - Blade templates
- `vendor/` - Production dependencies only
- `artisan` - CLI tool
- `composer.json` & `composer.lock` - Metadata

**Excluded from runtime:**
- `database/` - Migrations/seeders (not needed in containers)
- `tests/` - Test files
- `node_modules/` - Build-time only
- Dev dependencies

### 5. Composer Optimizations
```bash
--no-dev                    # Skip dev dependencies
--optimize-autoloader       # Optimize autoloader
--classmap-authoritative    # Use authoritative classmap
composer clear-cache        # Remove cache after install
```

### 6. Storage Structure
Creates minimal storage directories at build time instead of copying from builder:
- `storage/framework/{cache,sessions,testing,views}`
- `storage/{app,logs}`
- `bootstrap/cache`

## Build & Run

```bash
cd docker/production

# Build the image
docker compose build --no-cache

# Start services
docker compose up -d

# View logs
docker compose logs -f app

# Check image size
docker images evkin-builder:production
```

## Expected Image Size

- **Base FrankenPHP Alpine**: ~200MB
- **Final Image**: ~300-500MB (depending on vendor size and assets)
- **Previous Debian-based**: ~1GB+

## Services

### App
- FrankenPHP + Laravel Octane
- Port: 8082 → 80
- Healthcheck on `/`

### Worker
- Queue worker: `php artisan queue:work`
- Shared storage volume with app

## Environment Variables

Configure via `docker/production/.env.production`:

```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:your-key-here
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_user
DB_PASSWORD=your_password

CACHE_STORE=redis
QUEUE_CONNECTION=redis
REDIS_HOST=redis
REDIS_PORT=6379
```

## Production Checklist

- [ ] Set proper `APP_KEY`
- [ ] Configure database credentials
- [ ] Set `APP_URL` to production domain
- [ ] Enable HTTPS/SSL termination
- [ ] Configure Redis if using caching/queues
- [ ] Set up log rotation
- [ ] Configure backup strategy
- [ ] Set resource limits in compose (memory, CPU)

## Troubleshooting

### Image Still Large?
```bash
# Check layer sizes
docker history evkin-builder:production

# Verify .dockerignore is working
docker compose build --progress=plain 2>&1 | grep "COPY"
```

### Missing Files at Runtime?
Add them to the COPY directives in Stage 3 of the Dockerfile.

### Composer Scripts Fail?
Ensure build-time dependencies are available in the builder stage.

# Project Gemini Context: Evkin

## Project Overview
**Evkin** is a specialized performance evaluation and reporting system built with **Laravel 12** and **React 19** (via **Inertia.js 2.0**). It is designed to handle complex performance calculations and generate detailed reports, specifically tailored for Indonesian government frameworks (e.g., Kepmendagri, PUPR).

### Key Technologies
- **Backend:** PHP 8.2+, Laravel 12.x
- **Frontend:** React 19, Inertia.js 2.0 (SSR enabled), Tailwind CSS 4, Radix UI, Lucide React, Chart.js
- **Database:** MariaDB/MySQL
- **Authentication:** Laravel Fortify
- **Excel Processing:** PHPSpreadsheet
- **Calculations:** Custom formula engine (`FormulaHelper`) for mathematical evaluations without `eval()`.
- **Infrastructure:** Docker (via `compose.yaml`), Vite, Laravel Octane.

### Architecture Highlights
- **Helpers:** Extensive use of helper classes in `app/Helpers` for domain-specific logic (formulas, date handling, role management).
- **Services:** Business logic for report generation and exports is encapsulated in `app/Services`.
- **Jobs:** Heavy export tasks (Excel/PDF) are handled asynchronously via Laravel's Queue system.
- **Routing:** Structured across several domain-specific route files: `master.php`, `transaksi.php`, `report.php`, and `settings.php`.

---

## Building and Running

### Prerequisites
- PHP 8.2+
- Node.js & npm
- Composer
- Docker (optional, for production-like environments)

### Standard Setup
```bash
# Automated setup (installs deps, copies .env, migrates, builds assets)
composer run setup
```

### Development
```bash
# Run all dev services (server, queue, logs, vite) concurrently
composer run dev

# For SSR development
composer run dev:ssr
```

### Testing & Quality
```bash
# Run tests
composer run test

# Frontend Linting & Formatting (Biome)
npm run lint
npm run format

# TypeScript Check
npm run types
```

### Docker
```bash
# Using Makefile for production-like builds
make setup
make up
```

---

## Development Conventions

### Coding Style
- **Backend:** Follows standard Laravel PSR-12 conventions. PSR-2/Laravel Pint is used for PHP formatting.
- **Frontend:** Uses **Biome** for lightning-fast linting and formatting of React components (`resources/js`).
- **Typing:** Strict TypeScript usage is encouraged for all frontend components and hooks.

### Implementation Patterns
- **Formula Management:** Performance indicators are calculated using the `FormulaHelper`, which safely parses and evaluates mathematical expressions.
- **Reporting:** Reports are typically generated via specific services in `app/Services/PerhitunganReport`.
- **Exports:** Large Excel exports are offloaded to `app/Jobs/ExportReportJob` and tracked via `ExcelProgressTracker` trait.
- **UI Components:** Built using Radix UI primitives for accessibility and styled with Tailwind CSS 4's utility-first approach.

### Git & Collaboration
- Avoid staging or committing changes unless explicitly requested.
- Use meaningful commit messages that explain the "why" behind changes.
- Ensure all tests pass (`composer run test`) and linting is clean (`npm run lint`) before finalizing changes.

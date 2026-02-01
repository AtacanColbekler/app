# zenXteknoloji E-Ticaret Sitesi PRD

## Problem Statement
Professional e-commerce website for zenXteknoloji with blue-white corporate theme, product listing, category sidebar, and search functionality. Uses MongoDB (PostgreSQL not available). Data synced via n8n workflow.

## Architecture
- **Frontend**: React + TailwindCSS + Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB (adapted from PostgreSQL schema)
- **Data Sync**: n8n webhook endpoint

## User Personas
1. **End Customer**: Browse products, search, view details, contact store
2. **Store Admin**: Sync products via n8n, manage inventory

## Core Requirements
- Product listing on main page
- Category sidebar filter
- Product search (name, model, barcode)
- Product detail page
- Turkish language interface
- Corporate blue-white theme
- Contact info display

## What's Been Implemented (2026-02-01)
- ✅ Homepage with hero section, category sidebar, product grid
- ✅ Product detail page with contact info
- ✅ Search functionality
- ✅ Category filtering
- ✅ Mobile responsive design
- ✅ Backend APIs: categories, products, search, sync
- ✅ n8n sync endpoint (POST /api/products/sync)
- ✅ MongoDB indexes for performance

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/categories | List all categories |
| GET | /api/products | List products (with ?category= filter) |
| GET | /api/products/search?q= | Search products |
| GET | /api/products/{model} | Single product detail |
| POST | /api/products/sync | n8n batch sync |

## Prioritized Backlog
### P0 (Critical)
- n8n workflow integration (user side)

### P1 (High)
- WhatsApp integration for quick contact
- Product comparison feature

### P2 (Medium)
- Customer favorites/wishlist
- Recently viewed products
- Price history tracking

## Next Tasks
1. Configure n8n workflow to send products to /api/products/sync
2. Add more product categories as inventory grows
3. Consider adding WhatsApp button for direct contact

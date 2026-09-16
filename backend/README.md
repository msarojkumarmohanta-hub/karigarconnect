 # KarigarConnect Backend

Node.js/Express/MongoDB API for the KarigarConnect artisan marketplace.

## Quick start

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run seed
npm run dev
```

The API listens on `http://localhost:5000`, health is available at `/api/v1/health`, and Swagger UI is at `/api/docs`.

Demo accounts use password `Demo@12345`:

| Role | Email |
|---|---|
| Artisan | artisan@demo.karigarconnect.local |
| Buyer | buyer@demo.karigarconnect.local |
| Admin | admin@demo.karigarconnect.local |

Set `MONGODB_URI`, JWT secrets, and `AI_API_KEY` in `.env`. Without an AI key, cataloging, descriptions, tags, and price suggestions return clearly labelled editable fallback recommendations. Without Cloudinary credentials, uploads are stored in the local `uploads` directory.

## API overview

Authentication: `/api/v1/auth`; products/search: `/api/v1/products`, `/api/v1/search/products`, `/api/v1/market/search`; categories: `/api/v1/categories`; AI: `/api/v1/ai`; orders/payments: `/api/v1/orders`, `/api/v1/payments`; artisan profiles and analytics: `/api/v1/artisans`, `/api/v1/artisans/me`, `/api/v1/artisans/dashboard`, `/api/v1/artisans/analytics`; admin APIs: `/api/v1/admin`; reviews: `/api/v1/products/:productId/reviews`; wishlist and notifications are protected by JWT.

Compatibility endpoints are also available at `/health`, `/api-docs`, `/api/v1/market/recommendations`, `/api/v1/orders/my-orders`, `/api/v1/orders/artisan-orders`, `/api/v1/products/my-products`, `/api/v1/products/upload`, and `/api/v1/ai/product-description`.

All responses use `{ success, message, data, pagination? }`; errors use `{ success: false, message, error: { code } }`. Prices are calculated server-side when orders are created, and AI output is advisory rather than authoritative.

## Frontend integration

The existing `index.html` uses the API when it is available. Configure a different API host before loading the page with `window.KARIGARCONNECT_API`, or use the default `http://localhost:5000/api/v1`. Authenticate once from the frontend with:

```js
await window.karigarConnectLogin('artisan@demo.karigarconnect.local', 'Demo@12345');
```

The marketplace and search are public. Catalog generation, publishing, wishlist, orders, notifications, dashboard, and profile APIs require the returned bearer token. For production, replace the demo login helper with the application's login screen and use HTTPS.

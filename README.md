# KarigarConnect frontend

Modern React/Vite frontend for the KarigarConnect artisan marketplace. The app uses the existing Express API and does not create mock backend data.

## Run locally

```bash
npm install
copy .env.example .env
npm run dev
```

The frontend runs on the Vite port shown in the terminal (normally `http://localhost:5173`).

## API configuration

The API defaults to `http://localhost:5000/api/v1`. Configure it with:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

For a deployed build, the runtime override takes precedence:

```html
<script>window.KARIGARCONNECT_API = 'https://your-api.example.com/api/v1'</script>
```

JWT access tokens are stored in browser storage and automatically sent as Bearer tokens by the centralized Axios client. Expired sessions are cleared and protected routes redirect to sign-in.

## Included flows

- Public marketplace, category, artisan, product detail and responsive navigation screens
- Buyer authentication, cart, checkout/order creation, wishlist, notifications and order list
- Artisan dashboard, product data, orders and AI catalog generation through `/ai/catalog`
- Admin dashboard with platform statistics, product and order records
- Real API-backed loading, empty and error states

The backend remains the source of truth for roles, permissions, prices, order totals and AI output. Start the backend separately from `backend/` with `npm run dev`.

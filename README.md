# LOADEX

LOADEX is a gaming accessories e-commerce system with separate customer and administrator workflows.

## Tech Stack

- Frontend: React, React Router, CSS
- Backend: Express, SQL Server, JWT authentication
- Storage: SQL Server tables for users, products, orders, and order items
- Uploads: Multer image uploads served from `/uploads`

## Core Features

- Customer registration and login
- Product browsing with search and category filters
- Cart quantity controls
- Checkout with cash-on-delivery shipping details
- Customer order history
- Admin-only product management
- Admin-only order management and order details
- Admin dashboard stats for products, orders, pending orders, and users
- Role-based route protection on both frontend and backend

## Demo Accounts

Admin:

```txt
Email: tungsahur@email.com
Password: Admin1234
```

Customer:

```txt
Email: justinbebot@email.com
Password: User1234
```

Use the admin account for product and order management. Admin users are intentionally redirected away from customer cart and checkout pages.

## Local Setup

Backend:

```powershell
cd C:\Users\LENOVO\Documents\LOADEX\backend
copy .env.example .env
npm install
npm.cmd run dev
```

Frontend:

```powershell
cd C:\Users\LENOVO\Documents\LOADEX\frontend
copy .env.example .env
npm install
npm.cmd start
```

Open:

```txt
http://localhost:3000
```

## Deployment Notes

The `vercel-deploy` branch is prepared to deploy the frontend and backend together on Vercel, with Neon Postgres as the online database.

Vercel project settings:

```txt
Root Directory: LOADEX repository root
Build Command: npm run build
Output Directory: frontend/build
Install Command: npm install
```

Vercel environment variables:

```txt
DATABASE_URL=your_neon_postgres_connection_string
JWT_SECRET=replace_with_a_long_random_secret
SEED_ADMIN_EMAIL=tungsahur@email.com
SEED_ADMIN_PASSWORD=Admin1234
SEED_ADMIN_NAME=LOADEX Admin
```

For a same-domain Vercel deployment, `REACT_APP_API_URL` can be left unset. The frontend will call `/api/...` on the deployed Vercel domain.

On first API request, the backend creates the required Neon tables and seeds the default admin account and sample products if they do not exist yet.

## Environment Variables

Backend `.env`:

```txt
DATABASE_URL=your_neon_postgres_connection_string
JWT_SECRET=replace_with_a_long_random_secret
SEED_ADMIN_EMAIL=tungsahur@email.com
SEED_ADMIN_PASSWORD=Admin1234
SEED_ADMIN_NAME=LOADEX Admin
```

Frontend `.env`:

```txt
REACT_APP_API_URL=http://localhost:5050
```

## Defense Notes

- Admin access is enforced in backend middleware, not only hidden in the UI.
- Passwords are hashed with bcrypt before storage.
- JWT tokens carry user identity and role, then protected routes verify the token.
- File uploads are limited to images and capped at 5MB.
- Order totals are validated server-side against submitted cart items.
- Product inputs and shipping fields are validated server-side.

## Screenshots

Capture these screens before presenting or submitting documentation:

- Login page
- Customer dashboard with product search/filtering
- Cart and checkout pages
- Customer order history
- Admin orders page with stats and expanded order details
- Admin product management with the delete confirmation modal

## Known Limitations

- Payment is cash on delivery only.
- Product categories are inferred from product text and image filename instead of a dedicated category column.
- The frontend stores the cart in `localStorage`.
- Demo credentials are for presentation only and should be changed before real deployment.

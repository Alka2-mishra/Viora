# Viora Backend

Node.js + Express API backed by PostgreSQL for product and order management.

## Endpoints

- `GET /health`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `PATCH /api/orders/:id/status`

## Setup

1. Create a PostgreSQL database.
2. Run `backend/sql/schema.sql`.
3. Copy `.env.example` to `.env` and set `DATABASE_URL`.
4. Start the API with `npm run api`.

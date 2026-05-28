import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { pool } from './db.js';

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());

function parseProductRow(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    imageUrl: row.image_url,
    description: row.description,
    stock: row.stock,
    active: row.is_active,
    createdAt: row.created_at
  };
}

function parseOrderRow(row) {
  return {
    id: row.id,
    customerName: row.customer_name,
    email: row.email,
    address: row.address,
    status: row.status,
    total: Number(row.total),
    createdAt: row.created_at
  };
}

function validateProduct(body) {
  const errors = [];

  if (!body.name?.trim()) errors.push('name is required');
  if (!body.category?.trim()) errors.push('category is required');
  if (body.price === undefined || Number.isNaN(Number(body.price))) errors.push('price must be a number');
  if (body.stock === undefined || Number.isNaN(Number(body.stock))) errors.push('stock must be a number');
  if (!body.description?.trim()) errors.push('description is required');

  return errors;
}

app.get('/health', async (_request, response) => {
  response.json({ ok: true, service: 'viora-api' });
});

app.get('/api/products', async (request, response, next) => {
  try {
    const search = request.query.search?.toString().trim();
    const category = request.query.category?.toString().trim();

    const clauses = ['is_active = true'];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      clauses.push(`(name ILIKE $${values.length} OR description ILIKE $${values.length})`);
    }

    if (category) {
      values.push(category);
      clauses.push(`category = $${values.length}`);
    }

    const { rows } = await pool.query(
      `SELECT id, name, category, price, image_url, description, stock, is_active, created_at
       FROM products
       WHERE ${clauses.join(' AND ')}
       ORDER BY created_at DESC`,
      values
    );

    response.json(rows.map(parseProductRow));
  } catch (error) {
    next(error);
  }
});

app.get('/api/products/:id', async (request, response, next) => {
  try {
    const productId = Number(request.params.id);
    const { rows } = await pool.query(
      `SELECT id, name, category, price, image_url, description, stock, is_active, created_at
       FROM products
       WHERE id = $1`,
      [productId]
    );

    if (rows.length === 0) {
      return response.status(404).json({ message: 'Product not found' });
    }

    response.json(parseProductRow(rows[0]));
  } catch (error) {
    next(error);
  }
});

app.post('/api/products', async (request, response, next) => {
  try {
    const errors = validateProduct(request.body);
    if (errors.length > 0) {
      return response.status(400).json({ message: 'Invalid product payload', errors });
    }

    const { name, category, price, imageUrl, description, stock, active = true } = request.body;
    const { rows } = await pool.query(
      `INSERT INTO products (name, category, price, image_url, description, stock, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, category, price, image_url, description, stock, is_active, created_at`,
      [name.trim(), category.trim(), price, imageUrl || null, description.trim(), stock, Boolean(active)]
    );

    response.status(201).json(parseProductRow(rows[0]));
  } catch (error) {
    next(error);
  }
});

app.patch('/api/products/:id', async (request, response, next) => {
  try {
    const productId = Number(request.params.id);
    const fields = [];
    const values = [];
    const map = {
      name: 'name',
      category: 'category',
      price: 'price',
      imageUrl: 'image_url',
      description: 'description',
      stock: 'stock',
      active: 'is_active'
    };

    for (const [key, column] of Object.entries(map)) {
      if (request.body[key] !== undefined) {
        values.push(request.body[key]);
        fields.push(`${column} = $${values.length}`);
      }
    }

    if (fields.length === 0) {
      return response.status(400).json({ message: 'No updatable fields provided' });
    }

    values.push(productId);
    const { rows } = await pool.query(
      `UPDATE products
       SET ${fields.join(', ')}
       WHERE id = $${values.length}
       RETURNING id, name, category, price, image_url, description, stock, is_active, created_at`,
      values
    );

    if (rows.length === 0) {
      return response.status(404).json({ message: 'Product not found' });
    }

    response.json(parseProductRow(rows[0]));
  } catch (error) {
    next(error);
  }
});

app.delete('/api/products/:id', async (request, response, next) => {
  try {
    const productId = Number(request.params.id);
    const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [productId]);

    if (rowCount === 0) {
      return response.status(404).json({ message: 'Product not found' });
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get('/api/orders', async (request, response, next) => {
  try {
    const email = request.query.email?.toString().trim();
    const values = [];
    const whereClause = email ? 'WHERE email = $1' : '';
    if (email) values.push(email);

    const { rows } = await pool.query(
      `SELECT id, customer_name, email, address, status, total, created_at
       FROM orders
       ${whereClause}
       ORDER BY created_at DESC`,
      values
    );

    response.json(rows.map(parseOrderRow));
  } catch (error) {
    next(error);
  }
});

app.get('/api/orders/:id', async (request, response, next) => {
  try {
    const orderId = Number(request.params.id);
    const orderResult = await pool.query(
      `SELECT id, customer_name, email, address, status, total, created_at
       FROM orders
       WHERE id = $1`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return response.status(404).json({ message: 'Order not found' });
    }

    const itemsResult = await pool.query(
      `SELECT oi.id, oi.quantity, oi.unit_price, oi.line_total, p.id AS product_id, p.name, p.image_url
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1
       ORDER BY oi.id ASC`,
      [orderId]
    );

    response.json({
      ...parseOrderRow(orderResult.rows[0]),
      items: itemsResult.rows.map((row) => ({
        id: row.id,
        productId: row.product_id,
        name: row.name,
        imageUrl: row.image_url,
        quantity: row.quantity,
        unitPrice: Number(row.unit_price),
        lineTotal: Number(row.line_total)
      }))
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/orders', async (request, response, next) => {
  const client = await pool.connect();

  try {
    const { customerName, email, address, items } = request.body;

    if (!customerName?.trim() || !email?.trim() || !address?.trim()) {
      return response.status(400).json({ message: 'customerName, email, and address are required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return response.status(400).json({ message: 'items must be a non-empty array' });
    }

    const groupedItems = new Map();

    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity || 1);

      if (Number.isNaN(productId) || quantity <= 0) {
        return response.status(400).json({ message: 'Each item needs a valid productId and quantity' });
      }

      groupedItems.set(productId, (groupedItems.get(productId) || 0) + quantity);
    }

    const normalizedItems = Array.from(groupedItems, ([productId, quantity]) => ({
      productId,
      quantity
    }));

    await client.query('BEGIN');

    const productIds = normalizedItems.map((item) => item.productId);
    const { rows: productRows } = await client.query(
      `SELECT id, name, price, stock, is_active, image_url
       FROM products
       WHERE id = ANY($1::int[])`,
      [productIds]
    );

    if (productRows.length !== productIds.length) {
      throw new Error('One or more products were not found');
    }

    const productMap = new Map(productRows.map((row) => [row.id, row]));
    let total = 0;

    for (const item of normalizedItems) {
      const product = productMap.get(item.productId);
      if (!product.is_active) {
        throw new Error(`Product ${product.name} is inactive`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for ${product.name}`);
      }
      total += Number(product.price) * item.quantity;
    }

    const orderResult = await client.query(
      `INSERT INTO orders (customer_name, email, address, status, total)
       VALUES ($1, $2, $3, 'placed', $4)
       RETURNING id, customer_name, email, address, status, total, created_at`,
      [customerName.trim(), email.trim(), address.trim(), total]
    );

    const order = orderResult.rows[0];

    for (const item of normalizedItems) {
      const product = productMap.get(item.productId);
      const lineTotal = Number(product.price) * item.quantity;

      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, product.id, item.quantity, product.price, lineTotal]
      );

      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, product.id]);
    }

    await client.query('COMMIT');

    const orderItems = await pool.query(
      `SELECT oi.id, oi.quantity, oi.unit_price, oi.line_total, p.id AS product_id, p.name, p.image_url
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1
       ORDER BY oi.id ASC`,
      [order.id]
    );

    response.status(201).json({
      ...parseOrderRow(order),
      items: orderItems.rows.map((row) => ({
        id: row.id,
        productId: row.product_id,
        name: row.name,
        imageUrl: row.image_url,
        quantity: row.quantity,
        unitPrice: Number(row.unit_price),
        lineTotal: Number(row.line_total)
      }))
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

app.patch('/api/orders/:id/status', async (request, response, next) => {
  try {
    const orderId = Number(request.params.id);
    const status = request.body.status?.toString().trim();
    const allowedStatuses = ['placed', 'packed', 'shipped', 'delivered', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return response.status(400).json({ message: 'Invalid order status' });
    }

    const { rows } = await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2
       RETURNING id, customer_name, email, address, status, total, created_at`,
      [status, orderId]
    );

    if (rows.length === 0) {
      return response.status(404).json({ message: 'Order not found' });
    }

    response.json(parseOrderRow(rows[0]));
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({
    message: 'Server error',
    error: error.message
  });
});

app.listen(port, () => {
  console.log(`Viora API listening on http://localhost:${port}`);
});

INSERT INTO products (name, category, price, image_url, description, stock, is_active)
VALUES
  (
    'Rose Glow Serum',
    'Skincare',
    28.00,
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80',
    'Lightweight daily serum for a fresh and radiant finish.',
    40,
    TRUE
  ),
  (
    'Velvet Pink Lip Oil',
    'Beauty',
    18.00,
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
    'Soft shine lip oil with a glossy pink tint.',
    55,
    TRUE
  ),
  (
    'Blush Mist',
    'Fragrance',
    24.00,
    'https://images.unsplash.com/photo-1527799820374-dcf8b8f7b2c5?auto=format&fit=crop&w=900&q=80',
    'A delicate everyday mist with a sweet feminine profile.',
    35,
    TRUE
  ),
  (
    'Self Care Gift Box',
    'Sets',
    49.00,
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80',
    'Curated premium beauty essentials for gifting and special occasions.',
    20,
    TRUE
  )
ON CONFLICT DO NOTHING;

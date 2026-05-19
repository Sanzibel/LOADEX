CREATE TABLE loadex_orders (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT,
  total FLOAT,
  created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE loadex_order_items (
  id INT IDENTITY(1,1) PRIMARY KEY,
  order_id INT,
  product_id INT,
  qty INT,
  price FLOAT
);


CREATE TABLE orders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,
    total DECIMAL(10,2),
    name NVARCHAR(255),
    phone NVARCHAR(50),
    address NVARCHAR(255),
    city NVARCHAR(100),
    postal NVARCHAR(20),
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE order_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT,
    product_id INT,
    name NVARCHAR(255),
    price DECIMAL(10,2),
    qty INT
);

SELECT * FROM orders;
SELECT * FROM order_items;
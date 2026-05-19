USE loadex_db_v1;
GO

CREATE TABLE loadex_products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    image NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE()
);
GO

INSERT INTO loadex_products (name, description, price, image)
VALUES
('Gaming Mouse', 'High precision RGB mouse', 79.99, 'mouse.webp'),
('RGB Keyboard', 'Mechanical keyboard with lights', 149.99, 'keyboard.avif'),
('Gaming Headset', 'Surround sound headset', 129.99, 'headset.webp'),
('Gaming Monitor', '144Hz ultra smooth display', 399.99, 'monitor.jpg'),
('Controller', 'Wireless gaming controller', 99.99, 'gaming_controller.jpg'),
('Gaming Chair', 'Ergonomic comfort chair', 199.99, 'gaming_chair.jpg');

SELECT * FROM loadex_products;
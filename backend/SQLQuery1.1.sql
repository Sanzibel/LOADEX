ALTER TABLE orders
ADD status NVARCHAR(50) DEFAULT 'Pending';

SELECT * FROM orders;

UPDATE orders
SET status = 'Pending'
WHERE status IS NULL;


SELECT * FROM orders;

DELETE FROM order_items;

DELETE FROM orders;

DELETE FROM loadex_users_v1;


UPDATE loadex_users_v1
SET role = 'admin'
WHERE email = 'tungsahur@email.com';

SELECT name, email, role
FROM loadex_users_v1;
ALTER TABLE loadex_users_v1
ADD role NVARCHAR(20) DEFAULT 'user';

UPDATE loadex_users_v1
SET role = 'admin'
WHERE email = 'tungsahur@email.com';

UPDATE loadex_users_v1
SET role = 'user'
WHERE email = 'bomboclat@gmail.com';

SELECT email, role
FROM loadex_users_v1;

SELECT * FROM loadex_users_v1;

SELECT * FROM orders;
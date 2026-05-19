USE master;
GO

-- allow multiple connections
ALTER DATABASE loadex_db_v1 SET MULTI_USER;
GO

-- drop login if exists (clean reset)
IF EXISTS (SELECT * FROM sys.server_principals WHERE name = 'loadex_user_v1')
BEGIN
    DROP LOGIN loadex_user_v1;
END
GO

-- create login again
CREATE LOGIN loadex_user_v1 WITH PASSWORD = 'Loadex123!';
GO

-- switch to your database
USE loadex_db_v1;
GO

-- drop user if exists
IF EXISTS (SELECT * FROM sys.database_principals WHERE name = 'loadex_user_v1')
BEGIN
    DROP USER loadex_user_v1;
END
GO

-- create user linked to login
CREATE USER loadex_user_v1 FOR LOGIN loadex_user_v1;
GO

-- give full access
ALTER ROLE db_owner ADD MEMBER loadex_user_v1;
GO
const bcrypt = require("bcryptjs");
const { neon } = require("@neondatabase/serverless");

require("dotenv").config({ quiet: true });

let client;
let initPromise;

const defaultProducts = [
  {
    name: "LOADEX Core Mouse",
    description: "Official LOADEX precision mouse with lightweight control and customizable RGB lighting.",
    price: 1299.00,
    image: "mouse.webp",
    stock_count: 12,
    category: "LOADEX Accessories",
  },
  {
    name: "LOADEX Pulse Keyboard",
    description: "Official LOADEX tactile mechanical keyboard built for competitive gaming.",
    price: 2499.00,
    image: "keyboard.avif",
    stock_count: 8,
    category: "LOADEX Keyboards",
  },
  {
    name: "LOADEX Phantom Headset",
    description: "Official LOADEX surround headset with a clear mic and immersive audio.",
    price: 1899.00,
    image: "headset.webp",
    stock_count: 10,
    category: "LOADEX Audio",
  },
  {
    name: "LOADEX Nova Monitor",
    description: "Official LOADEX high-refresh display for smooth competitive play.",
    price: 8999.00,
    image: "monitor.jpg",
    stock_count: 5,
    category: "LOADEX Displays",
  },
  {
    name: "LOADEX Apex Controller",
    description: "Official LOADEX responsive controller for PC and console-style play.",
    price: 1599.00,
    image: "gaming_controller.jpg",
    stock_count: 9,
    category: "LOADEX Controllers",
  },
  {
    name: "LOADEX Command Chair",
    description: "Official LOADEX ergonomic chair designed for long gaming sessions.",
    price: 6999.00,
    image: "gaming_chair.jpg",
    stock_count: 4,
    category: "LOADEX Accessories",
  },
];

const getClient = () => {
  const databaseUrl =
    process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for deployment");
  }

  if (!client) {
    client = neon(databaseUrl);
  }

  return client;
};

const execMany = async (statements) => {
  const sql = getClient();

  for (const statement of statements) {
    await sql.query(statement);
  }
};

const initDB = async () => {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    await execMany([
      `
        CREATE TABLE IF NOT EXISTS loadex_users_v1 (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          id_image TEXT DEFAULT '',
          verification_status TEXT NOT NULL DEFAULT 'Pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `,
      `
        ALTER TABLE loadex_users_v1
        ADD COLUMN IF NOT EXISTS id_image TEXT DEFAULT ''
      `,
      `
        ALTER TABLE loadex_users_v1
        ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'Pending'
      `,
      `
        UPDATE loadex_users_v1
        SET verification_status = 'Verified'
        WHERE role = 'admin'
          AND verification_status <> 'Verified'
      `,
      `
        CREATE TABLE IF NOT EXISTS loadex_products (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          price NUMERIC(10, 2) NOT NULL,
          image TEXT DEFAULT '',
          category TEXT NOT NULL DEFAULT 'LOADEX Accessories',
          stock_count INTEGER NOT NULL DEFAULT 10,
          sold_count INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `,
      `
        ALTER TABLE loadex_products
        ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'LOADEX Accessories'
      `,
      `
        ALTER TABLE loadex_products
        ADD COLUMN IF NOT EXISTS stock_count INTEGER NOT NULL DEFAULT 10
      `,
      `
        ALTER TABLE loadex_products
        ADD COLUMN IF NOT EXISTS sold_count INTEGER NOT NULL DEFAULT 0
      `,
      `
        UPDATE loadex_products
        SET
          name = CASE name
            WHEN 'RGB Gaming Mouse' THEN 'LOADEX Core Mouse'
            WHEN 'Mechanical Gaming Keyboard' THEN 'LOADEX Pulse Keyboard'
            WHEN 'Surround Gaming Headset' THEN 'LOADEX Phantom Headset'
            WHEN 'Gaming Monitor' THEN 'LOADEX Nova Monitor'
            WHEN 'Wireless Controller' THEN 'LOADEX Apex Controller'
            WHEN 'Ergonomic Gaming Chair' THEN 'LOADEX Command Chair'
            ELSE name
          END,
          description = CASE name
            WHEN 'RGB Gaming Mouse' THEN 'Official LOADEX precision mouse with lightweight control and customizable RGB lighting.'
            WHEN 'Mechanical Gaming Keyboard' THEN 'Official LOADEX tactile mechanical keyboard built for competitive gaming.'
            WHEN 'Surround Gaming Headset' THEN 'Official LOADEX surround headset with a clear mic and immersive audio.'
            WHEN 'Gaming Monitor' THEN 'Official LOADEX high-refresh display for smooth competitive play.'
            WHEN 'Wireless Controller' THEN 'Official LOADEX responsive controller for PC and console-style play.'
            WHEN 'Ergonomic Gaming Chair' THEN 'Official LOADEX ergonomic chair designed for long gaming sessions.'
            ELSE description
          END,
          category = CASE
            WHEN image = 'keyboard.avif' THEN 'LOADEX Keyboards'
            WHEN image = 'headset.webp' THEN 'LOADEX Audio'
            WHEN image = 'monitor.jpg' THEN 'LOADEX Displays'
            WHEN image = 'gaming_controller.jpg' THEN 'LOADEX Controllers'
            ELSE 'LOADEX Accessories'
          END
        WHERE name IN (
          'RGB Gaming Mouse',
          'Mechanical Gaming Keyboard',
          'Surround Gaming Headset',
          'Gaming Monitor',
          'Wireless Controller',
          'Ergonomic Gaming Chair'
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES loadex_users_v1(id),
          total NUMERIC(10, 2) NOT NULL,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          address TEXT NOT NULL,
          city TEXT DEFAULT '',
          postal TEXT DEFAULT '',
          status TEXT NOT NULL DEFAULT 'Pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          product_id INTEGER,
          name TEXT NOT NULL,
          price NUMERIC(10, 2) NOT NULL,
          qty INTEGER NOT NULL
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS loadex_messages (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES loadex_users_v1(id) ON DELETE CASCADE,
          sender_role TEXT NOT NULL CHECK (sender_role IN ('user', 'admin')),
          message TEXT NOT NULL,
          read_by_customer BOOLEAN NOT NULL DEFAULT TRUE,
          read_by_admin BOOLEAN NOT NULL DEFAULT FALSE,
          image_url TEXT DEFAULT '',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `,
      `
        ALTER TABLE loadex_messages
        ADD COLUMN IF NOT EXISTS read_by_customer BOOLEAN NOT NULL DEFAULT TRUE
      `,
      `
        ALTER TABLE loadex_messages
        ADD COLUMN IF NOT EXISTS read_by_admin BOOLEAN NOT NULL DEFAULT FALSE
      `,
      `
        ALTER TABLE loadex_messages
        ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT ''
      `,
      `
        UPDATE loadex_messages
        SET
          read_by_customer = CASE
            WHEN sender_role = 'admin' THEN FALSE
            ELSE TRUE
          END,
          read_by_admin = CASE
            WHEN sender_role = 'user' THEN FALSE
            ELSE TRUE
          END
        WHERE
          (sender_role = 'admin' AND read_by_customer = TRUE)
          OR (sender_role = 'admin' AND read_by_admin = FALSE)
          OR (sender_role = 'user' AND read_by_customer = FALSE)
      `,
      `
        CREATE TABLE IF NOT EXISTS loadex_notifications (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES loadex_users_v1(id) ON DELETE CASCADE,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          is_read BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS loadex_product_reviews (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES loadex_users_v1(id) ON DELETE CASCADE,
          product_id INTEGER NOT NULL REFERENCES loadex_products(id) ON DELETE CASCADE,
          order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
          rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
          comment TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (user_id, product_id)
        )
      `,
    ]);

    const sql = getClient();
    const adminEmail =
      (process.env.SEED_ADMIN_EMAIL || "tungsahur@email.com")
        .trim()
        .toLowerCase();

    const adminPassword =
      process.env.SEED_ADMIN_PASSWORD || "Admin1234";

    const adminName =
      process.env.SEED_ADMIN_NAME || "LOADEX Admin";

    const existingAdmin =
      await sql.query(
        "SELECT id FROM loadex_users_v1 WHERE email = $1",
        [adminEmail]
      );

    if (existingAdmin.length === 0) {
      const hashedPassword =
        await bcrypt.hash(adminPassword, 10);

      await sql.query(
        `
          INSERT INTO loadex_users_v1 (
            name,
            email,
            password,
            role,
            verification_status
          )
          VALUES ($1, $2, $3, 'admin', 'Verified')
        `,
        [adminName, adminEmail, hashedPassword]
      );
    }

    const productCount =
      await sql.query("SELECT COUNT(*)::int AS count FROM loadex_products");

    if ((productCount[0]?.count || 0) === 0) {
      for (const product of defaultProducts) {
        await sql.query(
          `
            INSERT INTO loadex_products (
              name,
              description,
              price,
              image,
              stock_count,
              category
            )
            VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [
            product.name,
            product.description,
            product.price,
            product.image,
            product.stock_count,
            product.category,
          ]
        );
      }
    }
  })();

  return initPromise;
};

const query = async (statement, params = []) => {
  await initDB();
  const sql = getClient();
  return sql.query(statement, params);
};

module.exports = {
  query,
  initDB,
};

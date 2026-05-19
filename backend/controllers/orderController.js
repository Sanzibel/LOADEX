const { sql } = require("../config/db");

const VALID_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const validateShipping = (shipping) => {
  if (!shipping) {
    return "Missing shipping details";
  }

  const name =
    String(shipping.name || "").trim();

  const phone =
    String(shipping.phone || "").trim();

  const address =
    String(shipping.address || "").trim();

  if (name.length < 2) {
    return "Shipping name must be at least 2 characters";
  }

  if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) {
    return "Shipping phone number is invalid";
  }

  if (address.length < 5) {
    return "Shipping address must be at least 5 characters";
  }

  return "";
};

exports.createOrder = async (req, res) => {
  try {
    const { items, total, shipping } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    const shippingError =
      validateShipping(shipping);

    if (shippingError) {
      return res.status(400).json({
        message: shippingError,
      });
    }

    const invalidItem = items.find(
      (item) => !item.id || !item.name || Number(item.price) <= 0 || Number(item.qty) <= 0
    );

    if (invalidItem) {
      return res.status(400).json({
        message: "Invalid order item",
      });
    }

    const calculatedTotal = items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.qty),
      0
    );

    if (Math.abs(Number(total) - calculatedTotal) > 0.01) {
      return res.status(400).json({
        message: "Order total does not match cart items",
      });
    }

    const pool = await sql.connect();

    const orderResult = await pool
      .request()
      .input("user_id", sql.Int, userId)
      .input("total", sql.Decimal(10, 2), calculatedTotal)
      .input("name", sql.NVarChar, String(shipping.name).trim())
      .input("phone", sql.NVarChar, String(shipping.phone).trim())
      .input("address", sql.NVarChar, String(shipping.address).trim())
      .input("city", sql.NVarChar, String(shipping.city || "").trim())
      .input("postal", sql.NVarChar, String(shipping.postal || "").trim())
      .input("status", sql.NVarChar, "Pending")
      .query(`
        INSERT INTO orders (
          user_id,
          total,
          name,
          phone,
          address,
          city,
          postal,
          status
        )
        OUTPUT INSERTED.id
        VALUES (
          @user_id,
          @total,
          @name,
          @phone,
          @address,
          @city,
          @postal,
          @status
        )
      `);

    const orderId = orderResult.recordset[0].id;

    for (const item of items) {
      await pool
        .request()
        .input("order_id", sql.Int, orderId)
        .input("product_id", sql.Int, item.id)
        .input("name", sql.NVarChar, item.name)
        .input("price", sql.Decimal(10, 2), Number(item.price))
        .input("qty", sql.Int, Number(item.qty))
        .query(`
          INSERT INTO order_items (
            order_id,
            product_id,
            name,
            price,
            qty
          )
          VALUES (
            @order_id,
            @product_id,
            @name,
            @price,
            @qty
          )
        `);
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId,
    });

  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = await sql.connect();

    const result = await pool
      .request()
      .input("user_id", sql.Int, userId)
      .query(`
        SELECT *
        FROM orders
        WHERE user_id = @user_id
        ORDER BY created_at DESC
      `);

    res.json(result.recordset);

  } catch (err) {
    console.error("GET MY ORDERS ERROR:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.getMyOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const pool = await sql.connect();

    const orderResult = await pool
      .request()
      .input("id", sql.Int, id)
      .input("user_id", sql.Int, userId)
      .query(`
        SELECT *
        FROM orders
        WHERE id = @id
          AND user_id = @user_id
      `);

    const order = orderResult.recordset[0];

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const itemResult = await pool
      .request()
      .input("order_id", sql.Int, id)
      .query(`
        SELECT
          id,
          product_id,
          name,
          price,
          qty
        FROM order_items
        WHERE order_id = @order_id
        ORDER BY id
      `);

    res.json({
      order,
      items: itemResult.recordset,
    });

  } catch (err) {
    console.error("GET MY ORDER DETAILS ERROR:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.cancelMyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const pool = await sql.connect();

    const orderResult = await pool
      .request()
      .input("id", sql.Int, id)
      .input("user_id", sql.Int, userId)
      .query(`
        SELECT id, status
        FROM orders
        WHERE id = @id
          AND user_id = @user_id
      `);

    const order = orderResult.recordset[0];

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending orders can be cancelled",
      });
    }

    await pool
      .request()
      .input("id", sql.Int, id)
      .input("status", sql.NVarChar, "Cancelled")
      .query(`
        UPDATE orders
        SET status = @status
        WHERE id = @id
      `);

    res.json({
      message: "Order cancelled",
    });

  } catch (err) {
    console.error("CANCEL MY ORDER ERROR:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const pool = await sql.connect();

    const result = await pool
      .request()
      .query(`
        SELECT *
        FROM orders
        ORDER BY created_at DESC
      `);

    res.json(result.recordset);

  } catch (err) {
    console.error("GET ALL ORDERS ERROR:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const pool = await sql.connect();

    const result = await pool
      .request()
      .query(`
        SELECT
          (SELECT COUNT(*) FROM loadex_products) AS totalProducts,
          (SELECT COUNT(*) FROM orders) AS totalOrders,
          (SELECT COUNT(*) FROM orders WHERE status = 'Pending') AS pendingOrders,
          (SELECT COUNT(*) FROM loadex_users_v1) AS totalUsers
      `);

    res.json(result.recordset[0]);

  } catch (err) {
    console.error("GET ADMIN STATS ERROR:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect();

    const orderResult = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        SELECT *
        FROM orders
        WHERE id = @id
      `);

    const order = orderResult.recordset[0];

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const itemResult = await pool
      .request()
      .input("order_id", sql.Int, id)
      .query(`
        SELECT
          id,
          product_id,
          name,
          price,
          qty
        FROM order_items
        WHERE order_id = @order_id
        ORDER BY id
      `);

    res.json({
      order,
      items: itemResult.recordset,
    });

  } catch (err) {
    console.error("GET ORDER DETAILS ERROR:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const pool = await sql.connect();

    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("status", sql.NVarChar, status)
      .query(`
        UPDATE orders
        SET status = @status
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json({
      message: "Status updated",
    });

  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

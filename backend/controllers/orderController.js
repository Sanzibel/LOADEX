const db = require("../config/db");

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

  const name = String(shipping.name || "").trim();
  const phone = String(shipping.phone || "").trim();
  const address = String(shipping.address || "").trim();

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

    const shippingError = validateShipping(shipping);

    if (shippingError) {
      return res.status(400).json({
        message: shippingError,
      });
    }

    const invalidItem = items.find(
      (item) =>
        !item.id ||
        !item.name ||
        Number(item.price) <= 0 ||
        Number(item.qty) <= 0
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

    const orderResult = await db.query(
      `
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
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending')
        RETURNING id
      `,
      [
        userId,
        calculatedTotal,
        String(shipping.name).trim(),
        String(shipping.phone).trim(),
        String(shipping.address).trim(),
        String(shipping.city || "").trim(),
        String(shipping.postal || "").trim(),
      ]
    );

    const orderId = orderResult[0].id;

    for (const item of items) {
      await db.query(
        `
          INSERT INTO order_items (
            order_id,
            product_id,
            name,
            price,
            qty
          )
          VALUES ($1, $2, $3, $4, $5)
        `,
        [
          orderId,
          item.id,
          item.name,
          Number(item.price),
          Number(item.qty),
        ]
      );
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

    const result = await db.query(
      `
        SELECT *
        FROM orders
        WHERE user_id = $1
        ORDER BY created_at DESC
      `,
      [userId]
    );

    res.json(result);
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

    const orderResult = await db.query(
      `
        SELECT *
        FROM orders
        WHERE id = $1
          AND user_id = $2
      `,
      [id, userId]
    );

    const order = orderResult[0];

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const items = await db.query(
      `
        SELECT
          id,
          product_id,
          name,
          price,
          qty
        FROM order_items
        WHERE order_id = $1
        ORDER BY id
      `,
      [id]
    );

    res.json({
      order,
      items,
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

    const orderResult = await db.query(
      `
        SELECT id, status
        FROM orders
        WHERE id = $1
          AND user_id = $2
      `,
      [id, userId]
    );

    const order = orderResult[0];

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

    await db.query(
      `
        UPDATE orders
        SET status = 'Cancelled'
        WHERE id = $1
      `,
      [id]
    );

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
    const result = await db.query(`
      SELECT *
      FROM orders
      ORDER BY created_at DESC
    `);

    res.json(result);
  } catch (err) {
    console.error("GET ALL ORDERS ERROR:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        (SELECT COUNT(*)::int FROM loadex_products) AS "totalProducts",
        (SELECT COUNT(*)::int FROM orders) AS "totalOrders",
        (SELECT COUNT(*)::int FROM orders WHERE status = 'Pending') AS "pendingOrders",
        (SELECT COUNT(*)::int FROM loadex_users_v1) AS "totalUsers"
    `);

    res.json(result[0]);
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

    const orderResult = await db.query(
      `
        SELECT *
        FROM orders
        WHERE id = $1
      `,
      [id]
    );

    const order = orderResult[0];

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const items = await db.query(
      `
        SELECT
          id,
          product_id,
          name,
          price,
          qty
        FROM order_items
        WHERE order_id = $1
        ORDER BY id
      `,
      [id]
    );

    res.json({
      order,
      items,
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

    const result = await db.query(
      `
        UPDATE orders
        SET status = $1
        WHERE id = $2
        RETURNING id
      `,
      [status, id]
    );

    if (result.length === 0) {
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

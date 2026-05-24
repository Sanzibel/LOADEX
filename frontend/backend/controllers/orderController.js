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

    const userResult = await db.query(
      `
        SELECT verification_status
        FROM loadex_users_v1
        WHERE id = $1
      `,
      [userId]
    );

    const verificationStatus =
      userResult[0]?.verification_status || "Pending";

    if (verificationStatus !== "Verified") {
      return res.status(403).json({
        success: false,
        message:
          verificationStatus === "Declined"
            ? "Your ID verification was declined. Please contact admin before checking out."
            : "Your account is still pending ID verification. You can browse products, but checkout is locked until an admin approves your ID.",
      });
    }

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

    const productIds = items.map((item) => Number(item.id));
    const products = await db.query(
      `
        SELECT
          id,
          name,
          price,
          stock_count
        FROM loadex_products
        WHERE id = ANY($1::int[])
      `,
      [productIds]
    );

    const productMap = new Map(
      products.map((product) => [
        Number(product.id),
        product,
      ])
    );

    for (const item of items) {
      const product = productMap.get(Number(item.id));
      const qty = Number(item.qty);

      if (!product) {
        return res.status(400).json({
          message: `${item.name || "Product"} is no longer available`,
        });
      }

      if (Number(product.stock_count) <= 0) {
        return res.status(400).json({
          message: `${product.name} is sold out`,
        });
      }

      if (qty > Number(product.stock_count)) {
        return res.status(400).json({
          message: `Only ${product.stock_count} ${product.name} left in stock`,
        });
      }

      if (Number(item.price) !== Number(product.price)) {
        return res.status(400).json({
          message: `${product.name} price changed. Please refresh your cart.`,
        });
      }
    }

    const calculatedTotal = items.reduce((sum, item) => {
      const product = productMap.get(Number(item.id));

      return sum + Number(product.price) * Number(item.qty);
    }, 0);

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
      const product = productMap.get(Number(item.id));

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
          product.name,
          Number(product.price),
          Number(item.qty),
        ]
      );

      const stockResult = await db.query(
        `
          UPDATE loadex_products
          SET
            stock_count = stock_count - $1,
            sold_count = sold_count + $1
          WHERE id = $2
            AND stock_count >= $1
          RETURNING id
        `,
        [
          Number(item.qty),
          item.id,
        ]
      );

      if (stockResult.length === 0) {
        return res.status(400).json({
          success: false,
          message: `${product.name} stock changed. Please refresh your cart.`,
        });
      }
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
        (SELECT COUNT(*)::int FROM loadex_users_v1) AS "totalUsers",
        (SELECT COUNT(*)::int FROM loadex_users_v1 WHERE verification_status = 'Pending' AND role <> 'admin') AS "pendingVerifications"
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

    const existingResult = await db.query(
      `
        SELECT id, user_id, status
        FROM orders
        WHERE id = $1
      `,
      [id]
    );

    const existingOrder = existingResult[0];

    if (!existingOrder) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const result = await db.query(
      `
        UPDATE orders
        SET status = $1
        WHERE id = $2
        RETURNING id, user_id, status
      `,
      [status, id]
    );

    if (existingOrder.status !== status) {
      await db.query(
        `
          INSERT INTO loadex_notifications (
            user_id,
            order_id,
            title,
            message
          )
          VALUES ($1, $2, $3, $4)
        `,
        [
          result[0].user_id,
          result[0].id,
          `Order #${result[0].id} is now ${status}`,
          `Your LOADEX order status was updated from ${existingOrder.status} to ${status}.`,
        ]
      );
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

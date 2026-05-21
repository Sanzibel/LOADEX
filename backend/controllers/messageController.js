const db = require("../config/db");

const cleanMessage = (message) =>
  String(message || "").trim();

const cleanImage = (image) =>
  String(image || "").trim();

const validateImage = (image) => {
  if (!image) {
    return "";
  }

  if (!/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(image)) {
    return "Only PNG, JPG, WEBP, or GIF images can be sent";
  }

  if (image.length > 2800000) {
    return "Image must be under 2MB";
  }

  return "";
};

exports.getMyMessages = async (req, res) => {
  try {
    await db.query(
      `
        UPDATE loadex_messages
        SET read_by_customer = TRUE
        WHERE user_id = $1
          AND sender_role = 'admin'
      `,
      [req.user.id]
    );

    const messages = await db.query(
      `
        SELECT
          id,
          user_id,
          sender_role,
          message,
          read_by_customer,
          read_by_admin,
          image_url,
          created_at
        FROM loadex_messages
        WHERE user_id = $1
        ORDER BY created_at ASC, id ASC
      `,
      [req.user.id]
    );

    res.json(messages);
  } catch (err) {
    console.error("GET MY MESSAGES ERROR:", err);
    res.status(500).json({ message: "Unable to load messages" });
  }
};

exports.sendCustomerMessage = async (req, res) => {
  try {
    const message = cleanMessage(req.body.message);
    const imageUrl = cleanImage(req.body.imageUrl);
    const imageError = validateImage(imageUrl);

    if (imageError) {
      return res.status(400).json({ message: imageError });
    }

    if (message.length < 1 && !imageUrl) {
      return res.status(400).json({ message: "Message or image is required" });
    }

    if (message.length > 1000) {
      return res.status(400).json({ message: "Message is too long" });
    }

    const result = await db.query(
      `
        INSERT INTO loadex_messages (
          user_id,
          sender_role,
          message,
          read_by_customer,
          read_by_admin,
          image_url
        )
        VALUES ($1, 'user', $2, TRUE, FALSE, $3)
        RETURNING
          id,
          user_id,
          sender_role,
          message,
          read_by_customer,
          read_by_admin,
          image_url,
          created_at
      `,
      [req.user.id, message, imageUrl]
    );

    res.status(201).json(result[0]);
  } catch (err) {
    console.error("SEND CUSTOMER MESSAGE ERROR:", err);
    res.status(500).json({ message: "Unable to send message" });
  }
};

exports.getAdminThreads = async (req, res) => {
  try {
    const threads = await db.query(`
      SELECT
        u.id AS user_id,
        u.name,
        u.email,
        COALESCE(NULLIF(latest.message, ''), 'Image attachment') AS last_message,
        latest.sender_role AS last_sender_role,
        latest.created_at AS last_message_at,
        COUNT(CASE WHEN m.sender_role = 'user' AND m.read_by_admin = FALSE THEN 1 END)::int AS unread_count,
        COUNT(m.id)::int AS message_count
      FROM loadex_users_v1 u
      JOIN loadex_messages m ON m.user_id = u.id
      JOIN LATERAL (
        SELECT message, sender_role, created_at
        FROM loadex_messages
        WHERE user_id = u.id
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      ) latest ON TRUE
      WHERE u.role <> 'admin'
      GROUP BY
        u.id,
        u.name,
        u.email,
        latest.message,
        latest.sender_role,
        latest.created_at
      ORDER BY latest.created_at DESC
    `);

    res.json(threads);
  } catch (err) {
    console.error("GET ADMIN THREADS ERROR:", err);
    res.status(500).json({ message: "Unable to load message threads" });
  }
};

exports.getAdminThreadMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const userResult = await db.query(
      `
        SELECT id, name, email
        FROM loadex_users_v1
        WHERE id = $1
          AND role <> 'admin'
      `,
      [userId]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    await db.query(
      `
        UPDATE loadex_messages
        SET read_by_admin = TRUE
        WHERE user_id = $1
          AND sender_role = 'user'
      `,
      [userId]
    );

    const messages = await db.query(
      `
        SELECT
          id,
          user_id,
          sender_role,
          message,
          read_by_customer,
          read_by_admin,
          image_url,
          created_at
        FROM loadex_messages
        WHERE user_id = $1
        ORDER BY created_at ASC, id ASC
      `,
      [userId]
    );

    res.json({
      customer: userResult[0],
      messages,
    });
  } catch (err) {
    console.error("GET ADMIN THREAD MESSAGES ERROR:", err);
    res.status(500).json({ message: "Unable to load messages" });
  }
};

exports.sendAdminReply = async (req, res) => {
  try {
    const { userId } = req.params;
    const message = cleanMessage(req.body.message);
    const imageUrl = cleanImage(req.body.imageUrl);
    const imageError = validateImage(imageUrl);

    if (imageError) {
      return res.status(400).json({ message: imageError });
    }

    if (message.length < 1 && !imageUrl) {
      return res.status(400).json({ message: "Reply or image is required" });
    }

    if (message.length > 1000) {
      return res.status(400).json({ message: "Reply is too long" });
    }

    const userResult = await db.query(
      `
        SELECT id
        FROM loadex_users_v1
        WHERE id = $1
          AND role <> 'admin'
      `,
      [userId]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const result = await db.query(
      `
        INSERT INTO loadex_messages (
          user_id,
          sender_role,
          message,
          read_by_customer,
          read_by_admin,
          image_url
        )
        VALUES ($1, 'admin', $2, FALSE, TRUE, $3)
        RETURNING
          id,
          user_id,
          sender_role,
          message,
          read_by_customer,
          read_by_admin,
          image_url,
          created_at
      `,
      [userId, message, imageUrl]
    );

    res.status(201).json(result[0]);
  } catch (err) {
    console.error("SEND ADMIN REPLY ERROR:", err);
    res.status(500).json({ message: "Unable to send reply" });
  }
};

exports.getCustomerUnreadCount = async (req, res) => {
  try {
    const result = await db.query(
      `
        SELECT
          COUNT(*)::int AS count,
          MAX(created_at) AS latest_at
        FROM loadex_messages
        WHERE user_id = $1
          AND sender_role = 'admin'
          AND read_by_customer = FALSE
      `,
      [req.user.id]
    );

    res.json({
      count: result[0]?.count || 0,
      latestAt: result[0]?.latest_at || null,
    });
  } catch (err) {
    console.error("GET CUSTOMER MESSAGE COUNT ERROR:", err);
    res.status(500).json({ message: "Unable to load message count" });
  }
};

exports.getAdminUnreadCount = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        COUNT(*)::int AS count,
        MAX(created_at) AS latest_at
      FROM loadex_messages
      WHERE sender_role = 'user'
        AND read_by_admin = FALSE
    `);

    res.json({
      count: result[0]?.count || 0,
      latestAt: result[0]?.latest_at || null,
    });
  } catch (err) {
    console.error("GET ADMIN MESSAGE COUNT ERROR:", err);
    res.status(500).json({ message: "Unable to load message count" });
  }
};

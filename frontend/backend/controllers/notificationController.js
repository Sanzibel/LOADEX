const db = require("../config/db");

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await db.query(
      `
        SELECT
          id,
          order_id,
          title,
          message,
          is_read,
          created_at
        FROM loadex_notifications
        WHERE user_id = $1
        ORDER BY created_at DESC, id DESC
      `,
      [req.user.id]
    );

    res.json(notifications);
  } catch (err) {
    console.error("GET NOTIFICATIONS ERROR:", err);
    res.status(500).json({ message: "Unable to load notifications" });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const result = await db.query(
      `
        SELECT COUNT(*)::int AS count
        FROM loadex_notifications
        WHERE user_id = $1
          AND is_read = FALSE
      `,
      [req.user.id]
    );

    res.json({ count: result[0]?.count || 0 });
  } catch (err) {
    console.error("GET UNREAD COUNT ERROR:", err);
    res.status(500).json({ message: "Unable to load notifications" });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const result = await db.query(
      `
        UPDATE loadex_notifications
        SET is_read = TRUE
        WHERE id = $1
          AND user_id = $2
        RETURNING id
      `,
      [req.params.id, req.user.id]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("MARK NOTIFICATION READ ERROR:", err);
    res.status(500).json({ message: "Unable to update notification" });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    await db.query(
      `
        UPDATE loadex_notifications
        SET is_read = TRUE
        WHERE user_id = $1
      `,
      [req.user.id]
    );

    res.json({ message: "Notifications marked as read" });
  } catch (err) {
    console.error("MARK ALL NOTIFICATIONS READ ERROR:", err);
    res.status(500).json({ message: "Unable to update notifications" });
  }
};

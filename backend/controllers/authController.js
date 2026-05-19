const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sql } = require("../config/db");
require("dotenv").config({ quiet: true });

const validatePassword = (password) => {
  const value =
    String(password || "");

  return (
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /[0-9]/.test(value)
  );
};

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

exports.registerUser = async (req, res) => {
  const {
    name,
    email,
    password
  } = req.body;

  try {
    const cleanName =
      String(name || "").trim();

    const cleanEmail =
      String(email || "").trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      return res.status(400).json({
        message: "all fields are required"
      });
    }

    if (cleanName.length < 2) {
      return res.status(400).json({
        message: "name must be at least 2 characters"
      });
    }

    if (!validateEmail(cleanEmail)) {
      return res.status(400).json({
        message: "please enter a valid email address"
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "password must be at least 8 chars, include uppercase, lowercase, and number",
      });
    }

    const pool = await sql.connect();

    const existingUser = await pool
      .request()
      .input("email", sql.VarChar, cleanEmail)
      .query(`
        SELECT *
        FROM loadex_users_v1
        WHERE email = @email
      `);

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({
        message: "email already registered"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    await pool
      .request()
      .input("name", sql.VarChar, cleanName)
      .input("email", sql.VarChar, cleanEmail)
      .input("password", sql.VarChar, hashedPassword)
      .query(`
        INSERT INTO loadex_users_v1
        (
          name,
          email,
          password
        )
        VALUES
        (
          @name,
          @email,
          @password
        )
      `);

    res.status(201).json({
      message: "user registered successfully"
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);

    res.status(500).json({
      message:
        err.message || "server error",
    });
  }
};

exports.loginUser = async (req, res) => {
  const {
    email,
    password
  } = req.body;

  try {
    const cleanEmail =
      String(email || "").trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({
        message: "all fields are required"
      });
    }

    const pool = await sql.connect();

    const result = await pool
      .request()
      .input("email", sql.VarChar, cleanEmail)
      .query(`
        SELECT *
        FROM loadex_users_v1
        WHERE email = @email
      `);

    const user =
      result.recordset[0];

    if (!user) {
      return res.status(400).json({
        message: "invalid credentials"
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        message: "invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role || "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      message:
        "login successful",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    res.status(500).json({
      message:
        err.message || "server error",
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId =
      req.user.id;

    const pool =
      await sql.connect();

    const result = await pool
      .request()
      .input("id", sql.Int, userId)
      .query(`
        SELECT
          id,
          name,
          email,
          role
        FROM loadex_users_v1
        WHERE id = @id
      `);

    const user =
      result.recordset[0];

    if (!user) {
      return res.status(404).json({
        message: "user not found"
      });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
      },
    });

  } catch (err) {
    console.error("PROFILE ERROR:", err);

    res.status(500).json({
      message:
        err.message || "server error",
    });
  }
};

const { sql } =
  require("../config/db");

const validateProductInput = ({ name, description, price }) => {
  const trimmedName =
    String(name || "").trim();

  const trimmedDescription =
    String(description || "").trim();

  const numericPrice =
    Number(price);

  if (trimmedName.length < 2) {
    return "Product name must be at least 2 characters";
  }

  if (trimmedDescription.length < 5) {
    return "Product description must be at least 5 characters";
  }

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return "Product price must be greater than 0";
  }

  return "";
};

// ✅ GET ALL PRODUCTS
exports.getProducts = async (req, res) => {

  try {

    const pool =
      await sql.connect();

    const result =
      await pool
        .request()
        .query(`
          SELECT
            id,
            name,
            description,
            price,
            image
          FROM loadex_products
          ORDER BY id DESC
        `);

    res.json(
      result.recordset
    );

  } catch (err) {

    console.error(
      "GET PRODUCTS ERROR:",
      err
    );

    res.status(500).json({
      message: "server error"
    });
  }
};

// ✅ GET SINGLE PRODUCT
exports.getProductById =
  async (req, res) => {

    try {

      const { id } =
        req.params;

      if (Number.isNaN(Number(id))) {
        return res.status(400).json({
          message: "Invalid product id"
        });
      }

      const pool =
        await sql.connect();

      const result =
        await pool
          .request()
          .input(
            "id",
            sql.Int,
            id
          )
          .query(`
            SELECT
              id,
              name,
              description,
              price,
              image
            FROM loadex_products
            WHERE id = @id
          `);

      if (
        result.recordset.length === 0
      ) {

        return res.status(404).json({
          message:
            "Product not found"
        });
      }

      res.json(
        result.recordset[0]
      );

    } catch (err) {

      console.error(
        "GET PRODUCT ERROR:",
        err
      );

      res.status(500).json({
        message: "server error"
      });
    }
  };

// ✅ CREATE PRODUCT
exports.createProduct =
  async (req, res) => {

    try {

      const {
        name,
        description,
        price
      } = req.body;

      const validationError =
        validateProductInput({
          name,
          description,
          price,
        });

      if (validationError) {
        return res.status(400).json({
          message: validationError,
        });
      }

      // ✅ FIXED IMAGE PATH
      const image =
        req.file
          ? `/uploads/${req.file.filename}`
          : "";

      const pool =
        await sql.connect();

      await pool
        .request()
        .input(
          "name",
          sql.NVarChar,
          String(name).trim()
        )
        .input(
          "description",
          sql.NVarChar,
          String(description).trim()
        )
        .input(
          "price",
          sql.Decimal(10,2),
          price
        )
        .input(
          "image",
          sql.NVarChar,
          image
        )
        .query(`
          INSERT INTO loadex_products
          (
            name,
            description,
            price,
            image
          )
          VALUES
          (
            @name,
            @description,
            @price,
            @image
          )
        `);

      res.status(201).json({
        message:
          "Product created successfully"
      });

    } catch (err) {

      console.error(
        "CREATE PRODUCT ERROR:",
        err
      );

      res.status(500).json({
        message: "server error"
      });
    }
  };

// ✅ UPDATE PRODUCT
exports.updateProduct =
  async (req, res) => {

    try {

      const { id } =
        req.params;

      if (Number.isNaN(Number(id))) {
        return res.status(400).json({
          message: "Invalid product id"
        });
      }

      const {
        name,
        description,
        price
      } = req.body;

      const validationError =
        validateProductInput({
          name,
          description,
          price,
        });

      if (validationError) {
        return res.status(400).json({
          message: validationError,
        });
      }

      const pool =
        await sql.connect();

      // 🔥 GET CURRENT PRODUCT
      const currentProduct =
        await pool
          .request()
          .input(
            "id",
            sql.Int,
            id
          )
          .query(`
            SELECT *
            FROM loadex_products
            WHERE id = @id
          `);

      const oldProduct =
        currentProduct.recordset[0];

      if (!oldProduct) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      // ✅ FIXED IMAGE PATH
      const image =
        req.file
          ? `/uploads/${req.file.filename}`
          : oldProduct.image;

      await pool
        .request()
        .input(
          "id",
          sql.Int,
          id
        )
        .input(
          "name",
          sql.NVarChar,
          String(name).trim()
        )
        .input(
          "description",
          sql.NVarChar,
          String(description).trim()
        )
        .input(
          "price",
          sql.Decimal(10,2),
          price
        )
        .input(
          "image",
          sql.NVarChar,
          image
        )
        .query(`
          UPDATE loadex_products
          SET
            name = @name,
            description = @description,
            price = @price,
            image = @image
          WHERE id = @id
        `);

      res.json({
        message:
          "Product updated successfully"
      });

    } catch (err) {

      console.error(
        "UPDATE PRODUCT ERROR:",
        err
      );

      res.status(500).json({
        message: "server error"
      });
    }
  };

// ✅ DELETE PRODUCT
exports.deleteProduct =
  async (req, res) => {

    try {

      const { id } =
        req.params;

      if (Number.isNaN(Number(id))) {
        return res.status(400).json({
          message: "Invalid product id"
        });
      }

      const pool =
        await sql.connect();

      const result = await pool
        .request()
        .input(
          "id",
          sql.Int,
          id
        )
        .query(`
          DELETE FROM loadex_products
          WHERE id = @id
        `);

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      res.json({
        message:
          "Product deleted successfully"
      });

    } catch (err) {

      console.error(
        "DELETE PRODUCT ERROR:",
        err
      );

      res.status(500).json({
        message: "server error"
      });
    }
  };

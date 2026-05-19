const db = require("../config/db");

const validateProductInput = ({ name, description, price }) => {
  const trimmedName = String(name || "").trim();
  const trimmedDescription = String(description || "").trim();
  const numericPrice = Number(price);

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

const uploadedImageToDataUrl = (file) => {
  if (!file) {
    return "";
  }

  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};

exports.getProducts = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        id,
        name,
        description,
        price,
        image
      FROM loadex_products
      ORDER BY id DESC
    `);

    res.json(result);
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);

    res.status(500).json({
      message: "server error",
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (Number.isNaN(Number(id))) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const result = await db.query(
      `
        SELECT
          id,
          name,
          description,
          price,
          image
        FROM loadex_products
        WHERE id = $1
      `,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(result[0]);
  } catch (err) {
    console.error("GET PRODUCT ERROR:", err);

    res.status(500).json({
      message: "server error",
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price } = req.body;

    const validationError = validateProductInput({
      name,
      description,
      price,
    });

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    await db.query(
      `
        INSERT INTO loadex_products (name, description, price, image)
        VALUES ($1, $2, $3, $4)
      `,
      [
        String(name).trim(),
        String(description).trim(),
        Number(price),
        uploadedImageToDataUrl(req.file),
      ]
    );

    res.status(201).json({
      message: "Product created successfully",
    });
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);

    res.status(500).json({
      message: "server error",
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (Number.isNaN(Number(id))) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const { name, description, price } = req.body;

    const validationError = validateProductInput({
      name,
      description,
      price,
    });

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const currentProduct = await db.query(
      `
        SELECT *
        FROM loadex_products
        WHERE id = $1
      `,
      [id]
    );

    const oldProduct = currentProduct[0];

    if (!oldProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const image = req.file
      ? uploadedImageToDataUrl(req.file)
      : oldProduct.image;

    await db.query(
      `
        UPDATE loadex_products
        SET
          name = $1,
          description = $2,
          price = $3,
          image = $4
        WHERE id = $5
      `,
      [
        String(name).trim(),
        String(description).trim(),
        Number(price),
        image,
        id,
      ]
    );

    res.json({
      message: "Product updated successfully",
    });
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);

    res.status(500).json({
      message: "server error",
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (Number.isNaN(Number(id))) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const result = await db.query(
      `
        DELETE FROM loadex_products
        WHERE id = $1
        RETURNING id
      `,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);

    res.status(500).json({
      message: "server error",
    });
  }
};

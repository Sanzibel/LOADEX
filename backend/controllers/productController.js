const db = require("../config/db");

const BRAND_CATEGORIES = [
  "LOADEX Audio",
  "LOADEX Displays",
  "LOADEX Accessories",
  "LOADEX Keyboards",
  "LOADEX Controllers",
];

const validateProductInput = ({
  name,
  description,
  price,
  stock_count,
  category,
}) => {
  const trimmedName = String(name || "").trim();
  const trimmedDescription = String(description || "").trim();
  const numericPrice = Number(price);
  const numericStock = Number(stock_count);
  const trimmedCategory = String(category || "").trim();

  if (trimmedName.length < 2) {
    return "Product name must be at least 2 characters";
  }

  if (trimmedDescription.length < 5) {
    return "Product description must be at least 5 characters";
  }

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return "Product price must be greater than 0";
  }

  if (
    !Number.isInteger(numericStock) ||
    numericStock < 0
  ) {
    return "Product stock must be a whole number of 0 or more";
  }

  if (!BRAND_CATEGORIES.includes(trimmedCategory)) {
    return "Please choose a valid LOADEX product category";
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
        image,
        category,
        stock_count,
        sold_count
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
          image,
          category,
          stock_count,
          sold_count
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
    const { name, description, price, stock_count, category } = req.body;

    const validationError = validateProductInput({
      name,
      description,
      price,
      stock_count,
      category,
    });

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    await db.query(
      `
        INSERT INTO loadex_products (
          name,
          description,
          price,
          image,
          category,
          stock_count
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        String(name).trim(),
        String(description).trim(),
        Number(price),
        uploadedImageToDataUrl(req.file),
        String(category).trim(),
        Number(stock_count),
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

    const { name, description, price, stock_count, category } = req.body;

    const validationError = validateProductInput({
      name,
      description,
      price,
      stock_count,
      category,
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
          image = $4,
          category = $5,
          stock_count = $6
        WHERE id = $7
      `,
      [
        String(name).trim(),
        String(description).trim(),
        Number(price),
        image,
        String(category).trim(),
        Number(stock_count),
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

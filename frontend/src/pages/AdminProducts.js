import React, {
  useCallback,
  useEffect,
  useState
} from "react";

import { apiUrl, imageUrl } from "../config/api";
import { formatPeso } from "../utils/formatCurrency";

import mouse from "../assets/mouse.webp";
import keyboard from "../assets/keyboard.avif";
import headset from "../assets/headset.webp";
import monitor from "../assets/monitor.jpg";
import controller from "../assets/gaming_controller.jpg";
import chair from "../assets/gaming_chair.jpg";

const imageMap = {
  "mouse.webp": mouse,
  "keyboard.avif": keyboard,
  "headset.webp": headset,
  "monitor.jpg": monitor,
  "gaming_controller.jpg": controller,
  "gaming_chair.jpg": chair,
};

const brandCategories = [
  "LOADEX Audio",
  "LOADEX Displays",
  "LOADEX Accessories",
  "LOADEX Keyboards",
  "LOADEX Controllers",
];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "LOADEX Accessories",
  stock_count: "0",
  image: null,
};

const AdminProducts = () => {

  const [products, setProducts] =
    useState([]);

  const [editingId, setEditingId] =
    useState(null);

  const [preview, setPreview] =
    useState("");

  const [form, setForm] =
    useState(emptyForm);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState({
      type: "",
      text: "",
    });

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const fetchProducts = useCallback(async () => {

    try {

      setLoading(true);

      const res = await fetch(
        apiUrl("/api/products")
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.message || "Unable to load products.",
        });
        return;
      }

      setProducts(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(err);
      setMessage({
        type: "error",
        text: "Unable to load products.",
      });

    } finally {

      setLoading(false);
    }
  }, []);

  useEffect(() => {

    fetchProducts();

  }, [fetchProducts]);

  const getImageSrc = (image) => {

    if (!image) {
      return "";
    }

    if (
      image.startsWith("data:") ||
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.includes("uploads")
    ) {
      return imageUrl(image);
    }

    return imageMap[image];
  };

  const handleChange = (e) => {

    setForm({

      ...form,

      [e.target.name]:
        e.target.value,

    });
  };

  const handleImageChange = (e) => {

    const file =
      e.target.files[0];

    if (!file) return;

    setForm({

      ...form,

      image: file,

    });

    setPreview(
      URL.createObjectURL(file)
    );
  };

  const resetForm = () => {

    setForm(emptyForm);
    setPreview("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    setSaving(true);
    setMessage({
      type: "",
      text: "",
    });

    try {

      const token =
        localStorage.getItem("token");

      const formData =
        new FormData();

      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("stock_count", form.stock_count);

      if (form.image) {

        formData.append(
          "image",
          form.image
        );
      }

      const res = await fetch(
        editingId
          ? apiUrl(`/api/products/${editingId}`)
          : apiUrl("/api/products"),
        {
          method: editingId
            ? "PUT"
            : "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.message || "Unable to save product.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: data.message || "Product saved.",
      });

      resetForm();
      fetchProducts();

    } catch (err) {

      console.error(err);
      setMessage({
        type: "error",
        text: "Unable to save product.",
      });

    } finally {

      setSaving(false);
    }
  };

  const handleEdit = (product) => {

    setEditingId(product.id);

    setForm({

      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category || "LOADEX Accessories",
      stock_count: String(product.stock_count || 0),
      image: null,

    });

    setPreview(
      getImageSrc(product.image)
    );
  };

  const confirmDelete = async () => {

    if (!deleteTarget) return;

    try {

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        apiUrl(`/api/products/${deleteTarget.id}`),
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.message || "Unable to delete product.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: data.message || "Product deleted.",
      });

      setDeleteTarget(null);
      fetchProducts();

    } catch (err) {

      console.error(err);
      setMessage({
        type: "error",
        text: "Unable to delete product.",
      });
    }
  };

  return (
    <div className="admin-page">

      <div className="admin-container">

        <h1 className="title">
          Product Management
        </h1>

        {message.text && (
          <div className={`admin-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form
          className="product-form"
          onSubmit={handleSubmit}
        >

          <div className="form-header">
            <h2>
              {editingId
                ? "Edit Official LOADEX Product"
                : "Add Official LOADEX Product"}
            </h2>
            <p>
              Update the product catalog, brand category, price, stock, and display image.
            </p>
          </div>

          <label className="field-group">
            <span>Product Name</span>
            <input
              type="text"
              name="name"
              placeholder="Example: LOADEX Core Mouse"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field-group">
            <span>Description</span>
            <textarea
              name="description"
              placeholder="Short product description shown to customers"
              value={form.description}
              onChange={handleChange}
              required
            />
          </label>

          <div className="form-grid">
            <label className="field-group">
              <span>Price</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                name="price"
                placeholder="0.00"
                value={form.price}
                onChange={handleChange}
                required
              />
            </label>

            <label className="field-group">
              <span>Product Category</span>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                {brandCategories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span>Stock Count</span>
              <input
                type="number"
                min="0"
                step="1"
                name="stock_count"
                placeholder="Available quantity"
                value={form.stock_count}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <label className="field-group image-field">
            <span>Product Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            <small>
              Leave blank while editing to keep the current product image.
            </small>
          </label>

          {preview && (

            <img
              src={preview}
              alt="preview"
              className="preview-image"
            />

          )}

          <div className="form-actions">
            <button
              type="submit"
              disabled={saving}
            >

              {saving
                ? "Saving..."
                : editingId
                  ? "Update Product"
                  : "Add Product"}

            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>

        </form>

        {loading ? (
          <div className="empty-box">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="empty-box">
            No products yet.
          </div>
        ) : (
          <div className="product-list">

            {products.map((product) => (

              <div
                className="product-card"
                key={product.id}
              >

                <div className="product-left">

                  <img
                    src={getImageSrc(product.image)}
                    alt={product.name}
                    className="product-image"
                  />

                  <div>

                    <h3>
                      {product.name}
                    </h3>

                    <p>
                      {product.description}
                    </p>

                    <div className="category-pill">
                      {product.category || "LOADEX Accessories"}
                    </div>

                    <span>
                      {formatPeso(product.price)}
                    </span>

                    <div className="stock-meta">
                      <strong>
                        {Number(product.stock_count || 0) <= 0
                          ? "Sold Out"
                          : `${product.stock_count} in stock`}
                      </strong>
                      <small>
                        {product.sold_count || 0} sold
                      </small>
                    </div>

                  </div>

                </div>

                <div className="actions">

                  <button
                    className="edit-btn"
                    onClick={() =>
                      handleEdit(product)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      setDeleteTarget(product)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>

      {deleteTarget && (
        <div className="modal-backdrop">
          <div className="confirm-modal">
            <h2>Delete product?</h2>
            <p>
              This will remove {deleteTarget.name} from the catalog.
            </p>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                className="delete-btn"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`

        .admin-page {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .admin-container {
          width: 100%;
          max-width: 1000px;
        }

        .title {
          font-size: 40px;
          margin-bottom: 30px;
          color: #00e5ff;
          text-shadow: 0 0 15px #00e5ff;
        }

        .admin-message,
        .empty-box {
          margin-bottom: 20px;
          padding: 16px;
          border-radius: 10px;
          background: #0c0c14;
          border: 1px solid rgba(0,255,255,0.18);
          color: #aaa;
        }

        .admin-message.error {
          background: rgba(255, 0, 110, 0.14);
          border-color: rgba(255, 0, 110, 0.5);
          color: #ff8fbf;
        }

        .admin-message.success {
          background: rgba(0, 255, 170, 0.12);
          border-color: rgba(0, 255, 170, 0.5);
          color: #00ffaa;
        }

        .product-form {
          background: #0c0c14;
          padding: 25px;
          border-radius: 14px;
          margin-bottom: 40px;
          display: flex;
          flex-direction: column;
          gap: 15px;
          border: 1px solid rgba(0,255,255,0.15);
        }

        .form-header {
          padding-bottom: 6px;
        }

        .form-header h2 {
          margin: 0 0 8px;
          color: #00e5ff;
          font-size: 24px;
        }

        .form-header p {
          margin: 0;
          color: #9aa4b2;
          line-height: 1.45;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 15px;
        }

        .field-group {
          display: grid;
          gap: 8px;
        }

        .field-group span {
          color: #c8d0dc;
          font-size: 13px;
          font-weight: bold;
        }

        .field-group small {
          color: #7d8796;
          font-size: 12px;
        }

        .product-form input,
        .product-form select,
        .product-form textarea {
          background: #151824;
          border: none;
          padding: 14px;
          border-radius: 8px;
          color: white;
          outline: none;
        }

        .product-form textarea {
          min-height: 100px;
        }

        .product-form input:focus,
        .product-form select:focus,
        .product-form textarea:focus {
          border: 1px solid rgba(0,229,255,0.7);
          box-shadow: 0 0 12px rgba(0,229,255,0.18);
        }

        .image-field {
          padding: 14px;
          border-radius: 10px;
          background: #10131d;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .form-actions {
          display: flex;
          gap: 12px;
        }

        .product-form button,
        .modal-actions button {
          border: none;
          padding: 14px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }

        .product-form button[type="submit"] {
          flex: 1;
          background: #00c2d4;
          color: black;
        }

        .product-form button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .cancel-btn {
          background: #252b3a;
          color: #ddd;
        }

        .preview-image {
          width: 180px;
          height: 180px;
          object-fit: cover;
          border-radius: 12px;
          border: 1px solid rgba(0,255,255,0.2);
        }

        .product-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .product-card {
          background: #0c0c14;
          border: 1px solid rgba(0,255,255,0.15);
          border-radius: 14px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .product-left {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .product-image {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 12px;
        }

        .product-card h3 {
          margin-bottom: 8px;
        }

        .product-card p {
          color: #aaa;
          margin-bottom: 10px;
        }

        .category-pill {
          display: inline-block;
          margin-bottom: 10px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(168,85,247,0.14);
          border: 1px solid rgba(168,85,247,0.42);
          color: #c084fc;
          font-size: 12px;
          font-weight: bold;
        }

        .product-card span {
          color: #00ffaa;
          font-weight: bold;
        }

        .stock-meta {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-top: 8px;
          color: #ddd;
        }

        .stock-meta strong {
          color: #00e5ff;
        }

        .stock-meta small {
          color: #888;
        }

        .actions {
          display: flex;
          gap: 10px;
        }

        .actions button {
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        .edit-btn {
          background: #00c2d4;
          color: black;
        }

        .delete-btn {
          background: #ff006e;
          color: white;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.65);
        }

        .confirm-modal {
          width: min(420px, calc(100vw - 32px));
          background: #0c0c14;
          border: 1px solid rgba(255,0,110,0.35);
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 0 40px rgba(255,0,110,0.18);
        }

        .confirm-modal h2 {
          margin-top: 0;
          color: #ff8fbf;
        }

        .confirm-modal p {
          color: #bbb;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 22px;
        }

        @media (max-width: 820px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }

      `}</style>

    </div>
  );
};

export default AdminProducts;

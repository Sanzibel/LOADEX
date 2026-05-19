export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5050";

export const apiUrl = (path) =>
  `${API_BASE_URL}${path}`;

export const imageUrl = (image) => {
  if (!image) {
    return "";
  }

  if (image.includes("uploads")) {
    return `${API_BASE_URL}/${image.replace(/^\/+/, "")}`;
  }

  return "";
};

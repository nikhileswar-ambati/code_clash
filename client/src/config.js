export const DJANGO_API_BASE_URL =
  process.env.REACT_APP_DJANGO_API_BASE_URL || "http://127.0.0.1:8000";

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${DJANGO_API_BASE_URL}${normalizedPath}`;
};

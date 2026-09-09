export const getSisgarBaseUrl = () => {
  const explicitBaseUrl = process.env.SISGAR_BASE_URL?.trim();

  if (explicitBaseUrl) {
    return explicitBaseUrl.replace(/\/+$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/+$/, "");
  }

  return "http://localhost:3000";
};

export const buildSisgarUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSisgarBaseUrl()}${normalizedPath}`;
};

export const VALID = /^[a-zA-Z0-9_.-]+$/;
export const ALLOWED_ORIGINS = (process.env["ALLOWED_ORIGINS"] ?? "")
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

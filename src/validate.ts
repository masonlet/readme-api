import { VALID } from "./config.js";

export function validateParam(value: unknown): value is string {
  return typeof value === "string" && VALID.test(value);
}

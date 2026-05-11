import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../../src/cors.js";
import { validateParam } from "../../src/validate.js";
import { fetchReadme } from "../../src/readme.js";
import { HttpError } from "../../src/http-error.js";

export default async (
  req: VercelRequest,
  res: VercelResponse
): Promise<void> => {
  if (setCorsHeaders(req, res)) return;

  try {
    if (req.method !== "GET") throw new HttpError(405, "Method not allowed");

    const { owner, repo } = req.query;
    if (!validateParam(owner) || !validateParam(repo)) throw new HttpError(
      400, "Invalid or missing owner/repo"
    );

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    res.status(200).send(await fetchReadme(owner, repo));
  } catch (e) {
    if (e instanceof HttpError) {
      res.status(e.status).json({ error: e.message });
      return;
    }
    console.error("README endpoint error:", e);
    res.status(500).json({ error: "Server error" });
  }
};

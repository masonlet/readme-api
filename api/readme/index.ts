import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../../src/cors.js";
import { validateParam } from "../../src/validate.js";
import { ReadmeError, fetchReadme } from "../../src/readme.js";

export default async (
  req: VercelRequest,
  res: VercelResponse
): Promise<void> => {
  if (setCorsHeaders(req, res)) return;

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { owner, repo } = req.query;
  if (!validateParam(owner) || !validateParam(repo)) {
    res.status(400).json({ error: "Invalid or missing owner/repo" });
    return;
  }

  try {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    res.status(200).send(await fetchReadme(owner, repo));
  } catch (err) {
    if (err instanceof ReadmeError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    console.error("README endpoint error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

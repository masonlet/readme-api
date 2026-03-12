import type { VercelRequest, VercelResponse } from "@vercel/node";

const VALID = /^[a-zA-Z0-9_.-]+$/;
const ALLOWED_ORIGINS = (process.env["ALLOWED_ORIGINS"] ?? "")
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

function validateParam(value: unknown): value is string {
  return typeof value === "string" && VALID.test(value);
}

function setCorsHeaders(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers["origin"];
  if (origin !== undefined && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

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
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
    const headers = {
      "Accept": "application/vnd.github.html",      
      "User-Agent": "readme-api",
      ...(process.env["GITHUB_TOKEN"] && {
        Authorization: `token ${process.env["GITHUB_TOKEN"]}`
      }),
    };
    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      console.error(`GitHub API returned ${response.status} for ${owner}/${repo}`);
           
      if (response.status === 403 && 
          response.headers.get("x-ratelimit-remaining") === "0"
      ) {
        res.status(429).json({ error: "GitHub rate limit exceeded" });
        return;
      }

      res.status(response.status).json({ 
        error: `Failed to fetch README: ${response.status}` 
      });
      return;
    }

    const githubHtml = await response.text();
    if (!githubHtml?.trim()) {
      res.status(404).json({ error: "No README content found" });
      return;
    }

    const baseUrl = `https://github.com/${owner}/${repo}`;
    const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD`;

    const processedHtml = githubHtml
      .replace(/src="(?!http)(.*?)"/g, `src="${rawBase}/$1"`)
      .replace(/href="(?!http)(.*?)\.md"/g, `href="${baseUrl}/blob/HEAD/$1.md"`)
      .replace(/href="(?!http)(?!#)(.*?)"/g, `href="${baseUrl}/blob/HEAD/$1"`);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    res.status(200).send(processedHtml);
  } catch (err) {
    console.error("README endpoint error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

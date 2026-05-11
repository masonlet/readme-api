import { HttpError } from "./http-error.js";

export async function fetchReadme(owner: string, repo: string): Promise<string> {
   const headers = {
      "Accept": "application/vnd.github.html",
      "User-Agent": "readme-api",
      ...(process.env["GITHUB_TOKEN"] && {
        Authorization: `token ${process.env["GITHUB_TOKEN"]}`
      }),
    };

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      { headers }
    );

    if (!response.ok) {
      console.error(`GitHub API returned ${response.status} for ${owner}/${repo}`);

      if (response.status === 403
       && response.headers.get("x-ratelimit-remaining") === "0"
      ) throw new HttpError(429, "GitHub rate limit exceeded");

      throw new HttpError(response.status, `Failed to fetch README: ${response.status}`);
    }

    const html = await response.text();
    if (!html?.trim())  throw new HttpError(404, "No README content found");

    const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD`;
    const baseUrl = `https://github.com/${owner}/${repo}`;
    return html.replace(/src="(?!http)(.*?)"/g, `src="${rawBase}/$1"`)
               .replace(/href="(?!http)(.*?)\.md"/g, `href="${baseUrl}/blob/HEAD/$1.md"`)
               .replace(/href="(?!http)(?!#)(.*?)"/g, `href="${baseUrl}/blob/HEAD/$1"`);
}

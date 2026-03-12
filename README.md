# Readme API
Deployable GitHub README API

![License](https://img.shields.io/badge/License-MIT-green)
![Node](https://img.shields.io/badge/Node.js-18+-green)

## Features
- Fetches and returns rendered GitHub README HTML via GitHub's API
- Rewrites relative image/link URLs to absolute GitHub paths
- Optional GitHub token support for higher rate limits

## Usage
`GET /api/readme?owner={owner}&repo={repo}`

## Response
```text
Content-Type: text/html
Body: README html
Cached for 1 hour (s-maxage=3600)
```

## Deployment & Configuration

### Prerequisites
- Node.js 18+
- Vercel

### 1. Clone the Repository
```bash
git clone https://github.com/masonlet/readme-api.git
cd readme-api
npm install
```

### 2. Configure Environment
Fill in `.env` using `.env.example`

#### Environment Variables
| Variable | Description |
| -------- | ----------- |
| `GITHUB_TOKEN` | Optional GitHub personal access token for higher rate limits |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins |

### 3. Deploy
```bash
vercel deploy
```

## License
MIT License - see [LICENSE](./LICENSE) for details.

# Agent Runner

Standalone Node.js service for executing generated bot code outside Cloudflare Worker.

## Notes

- No dependencies are used, so `npm install` is not needed.

## Start

```bash
RUNNER_SECRET="your_secret" PORT=8788 npm start
```

## Cloudflare Worker configuration

Set these environment variables in the Cloudflare Worker:

- `AGENT_RUNNER_URL=https://your-domain.com/run-agent`
- `AGENT_RUNNER_SECRET=same_secret`

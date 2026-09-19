# 3. LiveKit on Render — ✅ deployed

I created the service directly through the Render connector:

- **Service:** `kizora-livekit`
- **URL:** `https://kizora-livekit.onrender.com`
- **WebSocket URL:** `wss://kizora-livekit.onrender.com`
- **API Key:** `APIKX6LcQjRP5`
- **API Secret:** `Mt4ilCKFZ6gHNvuEEfvMP6p2Tjjav5yp`

These are already filled into `.env.example`. It auto-deploys on every push to your `main` branch from here on.

## One honest technical caveat

Render's free/starter web services proxy standard web traffic (HTTP/WebSocket) but don't open raw UDP ports. LiveKit prefers UDP for media and falls back to TCP when UDP isn't available — so calls will work, but under real network conditions TCP fallback can mean slightly higher latency than a proper UDP media path. This is fine for testing and small meetings. If you outgrow it, the fix is either upgrading to a Render plan/instance type with UDP support or moving the media server to LiveKit Cloud, which handles this natively — the rest of the app doesn't change either way, just the `LIVEKIT_*` env vars.

Next: [04-vercel.md](04-vercel.md)

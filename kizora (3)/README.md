# Kizora

A Zoom/Google Meet–style video calling app: video/audio calls up to 200 people, screen share, background blur, chat, reactions, raise hand, shared whiteboard, host controls, cloud recording, custom meeting links, and report abuse/problem tools.

Built on:
- **Next.js** — the website/app itself
- **LiveKit** — the video/audio engine (self-hosted on Render), scales to 200 participants
- **Supabase** — database, auth, chat/report storage
- **Vercel** — hosts the live site
- **GitHub** — stores the code

## Setup — do these in order

1. [docs/01-github.md](docs/01-github.md) — get the code onto GitHub
2. [docs/02-supabase.md](docs/02-supabase.md) — ✅ already done for you, details inside
3. [docs/03-livekit-render.md](docs/03-livekit-render.md) — send me your repo URL and I'll finish this one too
4. [docs/04-vercel.md](docs/04-vercel.md) — deploy the website
5. [docs/05-testing-and-next-steps.md](docs/05-testing-and-next-steps.md) — test it, and what to harden before real users

Realistically just Parts 1 and 4 are on you now — 10–15 minutes.

## Local development (optional, after Parts 2 and 3 below)

```
cp .env.example .env.local   # fill in real values
npm install
npm run dev
```
Open http://localhost:3000

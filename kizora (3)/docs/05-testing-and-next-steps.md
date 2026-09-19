# 5. Test it, and what to do before real users show up

## Test it

1. Open your site, type a title, click **Start Meeting** — this creates a meeting and drops you straight into the call.
2. Copy the link (shown in the address bar as `/join/your-slug`) and open it in another browser tab, or send it to your phone, to join as a second participant.
3. Try: mute/camera, screen share, background blur, chat, reactions, raise hand, whiteboard, pin, and — as the host — mute-all, remove participant, and record.

## Solid and functional today

- Video/audio calling for up to 200 participants (LiveKit's SFU architecture, not simple peer-to-peer)
- Custom/shareable meeting links, optional password
- Chat, reactions, raise hand, screen share, background blur, pin video, gallery view
- Basic shared whiteboard
- Host controls: mute all, remove participant, end meeting
- Cloud recording (needs a storage bucket — see below)
- Report abuse / report a problem, saved to your database

## Before opening this to the public, budget time for:

- **Real authentication** — hosts currently sign in anonymously for simplicity. Swap in Supabase's email/Google login if you want persistent accounts, meeting history, and calendars.
- **Recording storage** — the record button calls LiveKit's Egress service, but it needs a real S3-compatible bucket (Supabase Storage, Cloudflare R2, or AWS S3) plugged into the `RECORDING_*` environment variables — see the comments in `app/api/recording/route.ts`.
- **Server-side host verification** — the `/api/moderate` route currently trusts whoever calls it. Before launch, check that the caller's LiveKit token actually carries host claims.
- **Captions/live transcription** — needs a speech-to-text service (e.g. Deepgram or AssemblyAI) wired into LiveKit's real-time audio; not included yet, but LiveKit has first-class support for adding this.
- **Avatars/custom themes/filters/virtual backgrounds beyond blur** — the blur button uses LiveKit's `BackgroundBlur` processor; a virtual background image or filter uses the same API with a different processor, easy to extend.
- **Scaling Render** — the free tier is fine for testing; for real 100–200 person meetings, upgrade the LiveKit service's plan for more CPU/bandwidth, or use LiveKit Cloud if you don't want to manage servers yourself.

Want any of these built into the project next — real login, virtual backgrounds, live captions, calendar/scheduling? Just ask.

# 2. Supabase — ✅ already set up for you

I created and configured this using the Supabase connection you gave me:

- **Project:** `kizora` (id `bgiqzhgavwetibusbkdg`, region `us-east-1`)
- **Schema:** every table applied — `profiles`, `meetings`, `participant_sessions`, `chat_messages`, `reports`, `recordings`, all with row-level security policies
- **Project URL:** `https://bgiqzhgavwetibusbkdg.supabase.co`
- **Anon (publishable) key:**
  `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnaXF6aGdhdndldGlidXNia2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3ODk5ODAsImV4cCI6MjEwNTM2NTk4MH0.owFAo0nPr8FDnqt0nFPpEcy3yyMgGdwo8Wc0mtEljkY`

These are already filled into `.env.example` for you — just copy it to `.env.local` (for local dev) or paste the same values into Vercel (Part 4).

## Two things I can't do through the connector — quick manual steps:

1. **Get your service role key** (needed for server-side writes): Supabase dashboard → your `kizora` project → **Project Settings → API** → reveal **service_role** key. Never expose this one in client code or commit it to GitHub.
2. **Turn on anonymous sign-in** (lets a host start an instant meeting without an account): dashboard → **Authentication → Providers** → toggle **Anonymous Sign-ins** on.

Next: [03-livekit-render.md](03-livekit-render.md)

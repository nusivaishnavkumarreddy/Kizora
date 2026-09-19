# 4. Deploy Kizora to Vercel

1. Go to https://vercel.com → sign in with GitHub.
2. Click **Add New** → **Project**, and import your `kizora` GitHub repo.
3. Before clicking Deploy, open **Environment Variables** and add every value from `.env.example`, using the real values you collected in Parts 2 and 3:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | from Supabase (Part 2) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase (Part 2) |
   | `SUPABASE_SERVICE_ROLE_KEY` | from Supabase (Part 2) |
   | `LIVEKIT_HOST` | from Render (Part 3) |
   | `LIVEKIT_API_KEY` | from Render (Part 3) |
   | `LIVEKIT_API_SECRET` | from Render (Part 3) |
   | `NEXT_PUBLIC_LIVEKIT_URL` | the `wss://` URL from Part 3 |
   | `NEXT_PUBLIC_SITE_URL` | leave blank for now — you'll fill this in after the first deploy |

4. Click **Deploy** and wait ~2 minutes.
5. Once deployed, Vercel gives you a URL like `https://kizora-yourname.vercel.app`. Go back into **Project Settings → Environment Variables**, set `NEXT_PUBLIC_SITE_URL` to that exact URL, then go to **Deployments** and click **Redeploy** so it picks up the change.

You're live — open your Vercel URL and you should see the Kizora home screen.

Next: [05-testing-and-next-steps.md](05-testing-and-next-steps.md)

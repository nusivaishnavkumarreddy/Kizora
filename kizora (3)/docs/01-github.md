# 1. Get the code onto GitHub

1. Go to https://github.com and create a free account if you don't have one.
2. Click the **+** in the top right → **New repository**. Name it `kizora`. Leave it empty (no README). Click **Create repository**.
3. On your own computer, open a terminal in the `kizora` project folder, then run:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/kizora.git
   git push -u origin main
   ```
   (Replace `YOUR-USERNAME` with your actual GitHub username.) GitHub will prompt you to sign in the first time you push.

Next: [02-supabase.md](02-supabase.md)

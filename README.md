# FMLA Letter Generator

Internal tool for generating FMLA Eligibility Notices (WH-381) and Designation Notices (WH-382) with Maine and Tennessee state overlays, and STD/PFML integration.

---

## Deploy to Vercel (one-time setup, ~10 minutes)

### Step 1 — Install prerequisites (if you don't have them)

Install **Node.js** from https://nodejs.org (LTS version).
Install **Git** from https://git-scm.com.

Verify both work:
```bash
node -v
git -v
```

---

### Step 2 — Set up a GitHub repository

1. Go to https://github.com and sign in (or create a free account).
2. Click **New repository** → name it `fmla-letter-generator` → set to **Private** → click **Create**.
3. Copy the repo URL shown (e.g. `https://github.com/yourname/fmla-letter-generator.git`).

---

### Step 3 — Push this project to GitHub

Open a terminal, navigate to this project folder, then run:

```bash
# Initialize git in this folder
git init
git add .
git commit -m "Initial commit — FMLA letter generator"

# Connect to your GitHub repo (paste your URL from Step 2)
git remote add origin https://github.com/yourname/fmla-letter-generator.git
git branch -M main
git push -u origin main
```

---

### Step 4 — Deploy on Vercel

1. Go to https://vercel.com and sign in with your GitHub account.
2. Click **Add New → Project**.
3. Find and select `fmla-letter-generator` from your GitHub repos.
4. Vercel auto-detects Vite — leave all settings as-is.
5. Click **Deploy**.

Vercel builds and deploys in ~60 seconds.
You'll get a permanent URL like: `https://fmla-letter-generator.vercel.app`

---

### Step 5 — Future updates

Whenever you update the app, push changes to GitHub and Vercel redeploys automatically:

```bash
git add .
git commit -m "describe your change"
git push
```

---

## Run locally (for testing before deploying)

```bash
npm install        # first time only
npm run dev        # starts at http://localhost:5173
```

---

## Project structure

```
fmla-generator/
├── index.html          # HTML entry point
├── vite.config.js      # Vite bundler config
├── vercel.json         # Vercel SPA routing rule
├── package.json        # Dependencies
├── .gitignore
└── src/
    ├── main.jsx        # React mount point
    └── App.jsx         # ← The entire FMLA letter generator
```

---

## Security note

This is a client-side only app — no data is sent to any server or stored anywhere.
For production use with real claim data, add authentication before sharing the Vercel URL broadly.
Vercel's free tier supports password protection via third-party auth (e.g. Clerk, Auth0) or you can restrict access by adding team members inside Vercel's dashboard.

---

## Making changes to the letter

All template logic lives in `src/App.jsx`.
Key sections to know:

| What you want to change | Where in App.jsx |
|---|---|
| State overlay logic (ME/TN) | Search `stateCode === "ME"` |
| Add a new state | Add to `STATES` array + add overlay blocks in `GeneratedLetter` |
| Add a form field | Add to `defaultForm` + add `<Input>` in the relevant form section |
| Change letter type behavior | Edit `showEN` / `showDN` logic near top of `GeneratedLetter` |
| Change branding/colors | Edit constants at top of file (`NAV`, `GOLD`, etc.) |

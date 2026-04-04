# HireReach — WhatsApp Recruitment Outreach

AI-powered recruitment outreach tool. Find candidates, send personalised WhatsApp messages with YES/NO polls, and track responses live.

## Project structure

```
hirereach/
├── index.html        ← Frontend (no API key needed here)
├── api/
│   └── claude.js     ← Vercel serverless function (API key lives here)
├── vercel.json       ← Vercel config
└── README.md
```

## Deploy to Vercel (3 steps)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create hirereach --public --push
```

### Step 2 — Import to Vercel
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `hirereach` repo
4. Click **Deploy** (no build settings needed)

### Step 3 — Add your API key as an environment variable
1. In your Vercel project → **Settings** → **Environment Variables**
2. Add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-api03-...` (your key from console.anthropic.com)
   - **Environment:** Production, Preview, Development (check all)
3. Click **Save**
4. Go to **Deployments** → click the 3 dots on your latest → **Redeploy**

Your app is now live at `https://your-project.vercel.app` 🎉

## Local development

```bash
npm install -g vercel
vercel dev
```

This runs the serverless function locally. Set your API key:
```bash
export ANTHROPIC_API_KEY=sk-ant-api03-...
vercel dev
```

Then open http://localhost:3000

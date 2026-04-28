# Task Commander — Vercel Deployment Guide

## 📌 Overview

This guide walks Bailey (or any non-technical user) through deploying Task Commander to Vercel in **4 easy steps** with **no coding required**.

**Total Time: 15–20 minutes**  
**Cost: FREE** (Vercel free tier)

---

## ✅ Prerequisites Checklist

Before starting, make sure you have:

- [ ] GitHub account (https://github.com)
  - If not, sign up for free
- [ ] Vercel account (https://vercel.com)
  - Sign up with GitHub for easiest setup
- [ ] Google Account with Calendar access
- [ ] Anthropic API key
  - Get from: https://console.anthropic.com
  - Free tier is fine
- [ ] Bailey's email address: bailey@beachheadlogistics.com.au

---

## 🚀 Step 1: Upload to GitHub (5 minutes)

### 1.1 Create a GitHub Repository

1. Go to https://github.com/new
2. **Repository name:** `task-commander`
3. **Description:** "Tactical task scheduling with Google Calendar"
4. **Visibility:** Public
5. **Add a README file:** ✓ Check the box
6. Click **"Create repository"**

### 1.2 Upload Task Commander Files

**Option A: Using Git (Command Line)**

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/task-commander.git
cd task-commander

# 2. Copy all Task Commander files into this folder
# (You'll have package.json, pages/, components/, etc.)

# 3. Push to GitHub
git add .
git commit -m "Add Task Commander application"
git push origin main
```

**Option B: Using GitHub Web Interface (No Command Line)**

1. In your GitHub repository, click **"Add file" → "Upload files"**
2. Drag and drop all Task Commander files (or click to select)
3. Files needed:
   - `package.json`
   - `next.config.js`
   - `jsconfig.json`
   - `.gitignore`
   - `.eslintrc.json`
   - `README.md`
   - Entire `pages/` folder
   - Entire `components/` folder
   - Entire `styles/` folder
   - Entire `public/` folder
   - `.env.example`

4. Click **"Commit changes"**

✅ **GitHub repository is now ready.**

---

## 🚀 Step 2: Create Vercel Account (2 minutes)

1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account
5. ✅ Account created!

---

## 🚀 Step 3: Deploy to Vercel (3 minutes)

1. In Vercel, click **"New Project"**
2. You'll see your GitHub repositories listed
3. Click **"Import"** next to `task-commander`
4. **Framework Preset:** Leave as "Next.js" (auto-detected)
5. **Project Name:** `task-commander` (or any name you like)
6. Click **"Deploy"**

**⏳ Vercel is now building your project (2–3 minutes)**

You'll see a build progress screen. Once it says **"✓ Deployment Successful"**, you're almost done!

---

## 🚀 Step 4: Add Environment Variables (5 minutes)

### 4.1 Gather Your Credentials

Before continuing, collect these values:

```
ANTHROPIC_API_KEY          = sk-ant-YOUR_KEY_FROM_CONSOLE
REACT_APP_TASK_CALENDAR_ID = YOUR_GOOGLE_CALENDAR_ID
REACT_APP_BAILEY_EMAIL     = bailey@beachheadlogistics.com.au
```

**Where to find them:**

**Anthropic API Key:**
- Go to https://console.anthropic.com
- Click "API Keys" (left sidebar)
- Copy your API key (starts with `sk-ant-`)

**Google Calendar ID:**
- Go to https://calendar.google.com
- Create a new calendar: **"Task Commander Operations"**
- Right-click the calendar → **"Settings"**
- Scroll to "Integrate calendar"
- Copy the **Calendar ID** (looks like: `abc123@group.calendar.google.com`)

### 4.2 Add Variables to Vercel

1. In Vercel, go to your `task-commander` project
2. Click **"Settings"** (top menu)
3. Go to **"Environment Variables"** (left sidebar)
4. Click **"Add New"** and enter each variable:

| Variable | Value |
|----------|-------|
| `ANTHROPIC_API_KEY` | sk-ant-YOUR_KEY_HERE |
| `REACT_APP_TASK_CALENDAR_ID` | abc123@group.calendar.google.com |
| `REACT_APP_PRIMARY_CALENDAR_ID` | primary |
| `REACT_APP_BAILEY_EMAIL` | bailey@beachheadlogistics.com.au |
| `REACT_APP_TIMEZONE` | Australia/Perth |
| `REACT_APP_FITNESS_LOCK_ENABLED` | true |
| `REACT_APP_CAPACITY_WARNING_THRESHOLD` | 80 |
| `REACT_APP_RESERVED_HOURS_DAILY` | 1.5 |

**After adding each variable, click "Add"**

### 4.3 Redeploy with New Variables

1. Go to **"Deployments"** tab
2. Click the **latest deployment** (top one)
3. Click **"Redeploy"**
4. ⏳ Wait 2–3 minutes for rebuild

**✅ Once it says "✓ Deployment Successful", you're done!**

---

## 🎯 Your Live App

Once deployment is complete, click **"Visit"** to see your live Task Commander!

The URL will be something like: `https://task-commander.vercel.app`

---

## ✅ First-Time Testing

Once your app is live, test these features:

1. **Create a task**
   - Click **"+ NEW TASK"**
   - Enter: Title, org, hours, timeframe
   - Click **"Create"**

2. **Verify it saved**
   - Refresh the page
   - Task should still be there ✓

3. **Sync to calendar**
   - Click **"SYNC CALENDAR"**
   - Wait for "✓ SYNCED" message
   - Check your Google Calendar — task should appear ✓

4. **Test Bailey assignment**
   - Create another task
   - Set "Assignee" to "Bailey Monaghan"
   - Click "Create"
   - Check Bailey's email (or spam folder)
   - She should receive a notification ✓

---

## 🆘 Troubleshooting

### Deployment fails with "build error"
- Check that ALL files are in the GitHub repo
- Verify `package.json` is in the root folder
- Try redeploying from Vercel dashboard

### App loads but styling looks broken
- Check Environment Variables are added
- Wait 5 minutes after redeploying
- Hard refresh browser (Ctrl+Shift+R)

### "API Key not found" error
- Go back to Vercel Settings → Environment Variables
- Verify `ANTHROPIC_API_KEY` is set
- Click "Redeploy" again

### Calendar sync not working
- Verify `REACT_APP_TASK_CALENDAR_ID` is correct
- Check Calendar ID doesn't have extra spaces
- Make sure Google Calendar is accessible to your account

### Bailey not receiving emails
- Double-check email spelling: `bailey@beachheadlogistics.com.au`
- Check Gmail spam folder
- Make sure Gmail MCP is enabled in Claude.ai Settings

---

## 📱 Access Your App Anytime

Once live, you can:

- **Share the URL** with Bailey or anyone
- **No installation needed** — it's a web app
- **Access from phone, tablet, desktop**
- **Data saves automatically** to your browser

---

## 🔄 Making Updates

If you need to change code:

1. Make changes to your local files
2. Push to GitHub (`git push`)
3. Vercel automatically redeploys! (1–2 minutes)

---

## ✨ You're Done!

Your Task Commander is now live and ready to use. 

**Next steps:**
- [ ] Brief Bailey on task assignment workflow
- [ ] Set up Friday 4pm as weekly review time
- [ ] Test full end-to-end workflow
- [ ] Monitor sync logs for issues

---

**Questions?** Refer to README.md or TASK_COMMANDER_INTEGRATION_GUIDE.md for technical details.

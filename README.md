# Task Commander

**Tactical Task Scheduling with Google Calendar Integration**

A production-grade React/Next.js application for managing tasks across 10 organizational categories with real-time Google Calendar synchronization and Bailey Monaghan task notifications.

---

## 📋 Quick Start

### Prerequisites
- Node.js 16+ installed
- GitHub account
- Vercel account (free tier OK)
- Google Account with Calendar access
- Anthropic API key

### Local Development (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Add your Anthropic API key to .env.local
# ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE

# 4. Run development server
npm run dev

# 5. Open http://localhost:3000 in browser
```

---

## 🚀 Deployment to Vercel (Recommended)

### Step-by-Step (10 minutes)

**Step 1: Create GitHub Repository**
- Go to https://github.com/new
- Name: `task-commander`
- Set to Public
- Add README
- Create repository

**Step 2: Upload Project Files**
- Clone the repo locally
- Copy all Task Commander files into the repo folder
- Push to GitHub:
  ```bash
  git add .
  git commit -m "Initial Task Commander deployment"
  git push
  ```

**Step 3: Deploy to Vercel**
- Go to https://vercel.com
- Click "New Project"
- Select your `task-commander` GitHub repo
- Framework: Next.js (auto-detected)
- Click "Deploy"

**Step 4: Add Environment Variables**
In Vercel Project Settings → Environment Variables, add:

```
ANTHROPIC_API_KEY = sk-ant-YOUR_KEY_HERE
REACT_APP_TASK_CALENDAR_ID = YOUR_CALENDAR_ID
REACT_APP_PRIMARY_CALENDAR_ID = primary
REACT_APP_BAILEY_EMAIL = bailey@beachheadlogistics.com.au
REACT_APP_TIMEZONE = Australia/Perth
REACT_APP_FITNESS_LOCK_ENABLED = true
REACT_APP_CAPACITY_WARNING_THRESHOLD = 80
REACT_APP_RESERVED_HOURS_DAILY = 1.5
```

**Step 5: Redeploy**
- Go to Deployments tab
- Click the latest deployment
- Click "Redeploy"
- Wait 2-3 minutes

---

## 📊 Features

### Task Management
- ✅ Create tasks in 3 timeframes: Today (Immediate) / This Week (Strategic) / Long-term
- ✅ Assign to 10 organizations (Beachhead, 1st Wave, MPL, IRG, etc.)
- ✅ Set priority: Critical / High / Normal / Low
- ✅ Assign to Self or Bailey Monaghan
- ✅ Track estimated hours per task
- ✅ Add descriptions and context

### Calendar Integration
- ✅ Sync tasks to Google Calendar with one click
- ✅ Auto-schedule tasks to avoid fitness times
- ✅ Send Bailey email notifications on assignment
- ✅ Conflict detection (appointments, fitness, existing events)
- ✅ Time horizon-based scheduling

### Fitness Schedule (Locked)
- Running: Mon, Wed, Fri, Sat @ 5:30am
- Gym: Mon–Sat @ 12:00pm
- Rest: Sunday
- *(Tasks automatically avoid these times)*

### Data Persistence
- All tasks saved to browser IndexedDB
- No data loss between sessions
- Complete sync history

---

## 🔧 How It Works

### Architecture

```
┌─────────────────┐
│  React UI       │  (Task Commander Component)
│  IndexedDB      │  (Local persistence)
└────────┬────────┘
         │
    ┌────▼─────┐
    │ SYNC      │  (One-click calendar sync)
    │ CALENDAR  │
    └────┬─────┘
         │
    ┌────▼───────────────────────┐
    │ API Route                   │
    │ /api/sync-calendar.js       │
    └────┬───────────────────────┘
         │
    ┌────▼─────────────────────────────────┐
    │ Anthropic API                        │
    │ claude-sonnet-4-20250514             │
    └────┬──────────────────────────────────┘
         │
    ┌────┴─────────────────┬──────────────────┐
    │                      │                  │
┌───▼────────────┐  ┌──────▼──────┐  ┌──────▼──────┐
│ Google Calendar│  │ Gmail MCP   │  │ State Mgmt  │
│ MCP            │  │ (Notify)    │  │             │
└────────────────┘  └─────────────┘  └─────────────┘
```

### Task-to-Calendar Mapping

**Today (Immediate)**
- Creates same-day calendar event
- Start time: 08:00 AM
- Duration: Task hours

**This Week (Strategic)**
- Distributed Mon–Fri
- Avoids fitness windows (5:30am runs, 12:00pm gym)
- Avoids conflicts with Thursday appointments

**Long-term**
- Scheduled 2 weeks out
- Weekly distribution
- Buffer for unplanned events

---

## 🎯 Organization Color Codes

| Org | Color | Shorthand |
|-----|-------|-----------|
| Beachhead Logistics | #1E5F74 | BHL |
| Culmination Point | #8B4513 | CP |
| 1st Wave | #0047AB | 1W |
| Meridian Project Logistics | #2F5233 | MPL |
| Ironbark Response Group | #1A1816 | IRG |
| Acme 1 | #4A4A4A | A1 |
| Acme 2 | #696969 | A2 |
| Personal & Fitness | #D4A574 | PF |
| Divorce / Legal | #C85A54 | DIV |
| ADF Reserve | #556270 | ADF |

---

## 📧 Bailey Workflow

1. **Task Created & Assigned to Bailey**
   - Email sent to bailey@beachheadlogistics.com.au
   - Subject: `[ORG] Task Title`
   - Calendar invite attached

2. **Bailey Responds**
   - ACCEPT: Task confirmed, added to calendar
   - DECLINE: Task removed, Jarod notified
   - CLARIFY: Question asked, task on hold

3. **Status Tracked**
   - UI shows Bailey's response status
   - Calendar updates on accept/decline
   - Weekly sync on Friday 4pm

---

## 🛠 Environment Variables Reference

| Variable | Value | Purpose |
|----------|-------|---------|
| `ANTHROPIC_API_KEY` | sk-ant-... | Required for API calls |
| `REACT_APP_TASK_CALENDAR_ID` | Calendar ID | Where tasks sync |
| `REACT_APP_PRIMARY_CALENDAR_ID` | primary | Default calendar |
| `REACT_APP_BAILEY_EMAIL` | email@company.com | Notification recipient |
| `REACT_APP_TIMEZONE` | Australia/Perth | Time zone for scheduling |
| `REACT_APP_FITNESS_LOCK_ENABLED` | true | Enable fitness blocking |
| `REACT_APP_CAPACITY_WARNING_THRESHOLD` | 80 | Hour capacity warning (%) |
| `REACT_APP_RESERVED_HOURS_DAILY` | 1.5 | Admin/buffer time daily |

---

## 📁 Project Structure

```
task-commander/
├── pages/
│   ├── _app.js                 # Next.js app wrapper
│   ├── index.js                # Home page
│   └── api/
│       └── sync-calendar.js    # Calendar sync API
├── components/
│   └── TaskCommander.js        # Main React component
├── styles/
│   └── globals.css             # Global styles
├── public/                      # Static assets
├── package.json                # Dependencies
├── next.config.js              # Next.js config
├── jsconfig.json               # JS path aliases
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

---

## 🧪 Testing

### Local Testing Checklist

- [ ] Run `npm install` without errors
- [ ] Run `npm run dev` — app loads at http://localhost:3000
- [ ] Create a new task (any org, Today timeframe)
- [ ] Task appears in "TODAY" section
- [ ] Delete task — removed from UI
- [ ] Change timeframe (Today → This Week) — task moves to new section
- [ ] Assign task to Bailey — UI shows "→ Bailey Monaghan"
- [ ] Click SYNC CALENDAR — sync status shows "SYNCED"

### Production Testing (Vercel)

- [ ] App loads from Vercel URL
- [ ] All styling displays correctly
- [ ] Create task — persists after page reload
- [ ] SYNC CALENDAR works end-to-end
- [ ] Check Gmail inbox for Bailey notification email

---

## 🔐 Security Notes

- **API Key**: Never commit `.env.local` to GitHub
- **CORS**: API requests handled server-side (no client-side API key exposure)
- **MCP Servers**: Authenticated via Anthropic account in Claude.ai
- **Gmail**: Only sends to configured Bailey email

---

## 📞 Support & Troubleshooting

### "Module not found" error
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### "ANTHROPIC_API_KEY not found"
- Check `.env.local` has the key
- In Vercel, verify Environment Variables in Project Settings
- Redeploy after adding variables

### Calendar sync not working
- Verify `REACT_APP_TASK_CALENDAR_ID` is correct
- Check Google Calendar permissions in Claude.ai Settings
- Try in Firefox/Chrome (not IE11)

### Bailey not receiving emails
- Confirm `REACT_APP_BAILEY_EMAIL` is correct
- Check Gmail MCP is authenticated in Claude.ai
- Look in Gmail spam folder

---

## 📝 Version History

**v1.0.0** — Initial release
- Task creation & management
- Google Calendar sync
- Bailey notifications
- Fitness schedule blocking
- 10-org categories

---

## 🎓 Next Steps

1. **Deploy to Vercel** (follow "Deployment" section above)
2. **Configure Google Calendar** (create "Task Commander Operations" calendar)
3. **Get Anthropic API Key** (https://console.anthropic.com)
4. **Brief Bailey** on ACCEPT/DECLINE/CLARIFY workflow
5. **Set Friday 4pm** as weekly review time
6. **Monitor** sync logs for issues

---

**Built with Next.js, React, Anthropic Claude, & Google Calendar MCP**

---

*For questions or issues, refer to TASK_COMMANDER_INTEGRATION_GUIDE.md (technical reference) or TESTING_DEPLOYMENT_CHECKLIST.md (deployment runbook).*

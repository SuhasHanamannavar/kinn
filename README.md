# Kin — AI Website Change Monitor

> Add a URL. Kin tells you when it matters.

Kin is an AI-powered SaaS platform that quietly monitors any website, detects meaningful changes, and sends plain-English alerts via email. Built for students, professionals, and researchers who can't afford to miss important updates.

## ✨ Features

- **Website Monitoring** — Add any URL, Kin checks it daily (or more frequently)
- **AI-Powered Analysis** — Llama 3 via Groq classifies changes by type and importance
- **Self-Healing Scrapers** — BrightData Web Unlocker with AI template healing
- **Plain-English Alerts** — No raw HTML diffs. Just clear, actionable summaries
- **Email Notifications** — Real-time alerts + weekly intelligence digest
- **Kin AI Companion** — Chat with Kin about your signals and monitored sites
- **Categories** — Deadlines, Pricing, Policy, Features, Announcements, Content
- **Importance Ranking** — High / Medium / Low classification

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Next.js    │────▶│  Supabase    │────▶│  BrightData  │
│  Frontend   │     │  PostgreSQL  │     │  Web Unlocker│
└─────────────┘     │  + pg_cron   │     └──────┬───────┘
       │            │  + pg_net    │            │
       │            └──────┬───────┘            ▼
       │                   │              ┌──────────────┐
       └───────────────────┼─────────────▶│  Groq API    │
                           │              │  (Llama 3)   │
                           │              └──────┬───────┘
                           ▼                     │
                    ┌──────────────┐             │
                    │  Edge        │◀────────────┘
                    │  Functions   │─────┐
                    └──────────────┘     │
                           ▲             ▼
                           │        ┌──────────────┐
                           └────────│  Resend      │
                                    │  Email API   │
                                    └──────────────┘
```

### Data Pipeline (6 Stages)

1. **User Auth & URL Input** → Next.js + Supabase Auth
2. **Persistence & Scheduling** → PostgreSQL + pg_cron
3. **BrightData Scraping** → Web Unlocker + AI Self-Healing
4. **Change Detection** → SHA-256 hashing + noise filtering + diff
5. **Groq AI Simplification** → Llama 3 classification & summarization
6. **Email Notification** → Resend API + React Email templates

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router) + React 18 + TypeScript |
| **Styling** | Tailwind CSS + Custom Design System |
| **Database** | Supabase PostgreSQL 15+ |
| **Auth** | Supabase Auth (GoTrue) — Email + OAuth |
| **Scheduling** | pg_cron + pg_net |
| **Backend** | Supabase Edge Functions (Deno/TypeScript) |
| **Scraping** | BrightData Web Unlocker + AI Self-Healing |
| **AI** | Groq API (Llama 3 70B) on LPU hardware |
| **Email** | Resend API |
| **Deployment** | Vercel (Frontend) + Supabase (Backend) |

## 📁 Project Structure

```
kin/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Marketing landing page
│   ├── app/                     # Authenticated application
│   │   ├── layout.tsx           # App shell with sidebar
│   │   ├── dashboard/page.tsx   # Overview dashboard
│   │   ├── signals/page.tsx     # Signal feed with filters
│   │   ├── watchlist/page.tsx   # URL management
│   │   ├── kin/page.tsx         # Kin AI chat interface
│   │   ├── digest/page.tsx      # Weekly intelligence brief
│   │   └── settings/page.tsx    # User preferences
│   └── auth/                    # Authentication pages
│       ├── sign-in/
│       ├── sign-up/
│       └── reset-password/
├── components/
│   ├── ui/                      # Design system primitives
│   │   ├── KinCharacter.tsx     # 🐧 Penguin mascot component
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Badges.tsx           # Pills, chips, toggles
│   │   └── SignalCard.tsx
│   └── layout/                  # App shell components
│       ├── Sidebar.tsx
│       ├── TopBar.tsx
│       └── AppShell.tsx
├── edge-functions/              # Supabase Edge Functions
│   ├── trigger-scraping/        # pg_cron → scrape queue
│   ├── scrape-url/              # BrightData fetch + snapshot
│   ├── process-change/          # Diff + noise filtering
│   ├── ai-summarize/            # Groq classification
│   ├── send-notification/       # Resend signal alerts
│   ├── send-digest/             # Weekly email digest
│   └── chat-message/            # Kin AI chat (RAG)
├── supabase/
│   ├── schema.sql               # Complete database schema
│   ├── server.ts                # Server/client creators
│   └── AuthProvider.tsx         # React auth context
├── lib/
│   ├── utils.ts                 # Helpers (cn, time, hashing)
│   └── sample-data.ts           # Demo data
├── types/
│   └── index.ts                 # TypeScript type definitions
├── styles/
│   └── globals.css              # Global styles + Tailwind
├── middleware.ts                # Auth route protection
├── tailwind.config.ts           # Kin design tokens
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- BrightData account (Web Unlocker)
- Groq API key
- Resend API key

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in your API keys in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# BrightData
BRIGHTDATA_API_KEY=your_api_key
BRIGHTDATA_CUSTOMER_ID=your_customer_id

# Groq
GROQ_API_KEY=your_groq_key

# Resend
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=alerts@yourdomain.com
```

### 3. Set up the database

1. Create a new Supabase project
2. Run the schema in `supabase/schema.sql` via the SQL Editor
3. Enable the following extensions: `pg_cron`, `pg_net`, `pgcrypto`, `uuid-ossp`

### 4. Deploy Edge Functions

```bash
# Login to Supabase CLI
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_ID

# Deploy all functions
supabase functions deploy trigger-scraping
supabase functions deploy scrape-url
supabase functions deploy process-change
supabase functions deploy ai-summarize
supabase functions deploy send-notification
supabase functions deploy send-digest
supabase functions deploy chat-message

# Set secrets for each function
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
supabase secrets set BRIGHTDATA_API_KEY=...
supabase secrets set BRIGHTDATA_CUSTOMER_ID=...
supabase secrets set GROQ_API_KEY=...
supabase secrets set RESEND_API_KEY=...
supabase secrets set RESEND_FROM_EMAIL=...
```

### 5. Run the development server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🐧 Kin — The Penguin AI Companion

Kin is not decorative branding. Kin is the personality of the product. The character appears in:

- **Landing page** — Hero and introduction
- **Sidebar** — Quick access to chat
- **Dashboard** — System status indicator
- **Chat interface** — Full conversational mode
- **Empty states** — Friendly guidance
- **Loading states** — Animated reactions

**Kin States:** `idle`, `listening`, `scanning`, `analyzing`, `found`, `important`, `thinking`

## 🎨 Design System

### Colors
- **Background**: `#FAFAF7` (warm off-white)
- **Primary**: `#1A1A1E` (near-black)
- **Muted**: `#5A5D6B` / `#8A8D9A`
- **Kin Beak**: `#FF8C42` / `#FF9A3C`
- **Kin Cheeks**: `#FFB347`

### Category Colors
| Category | Color |
|----------|-------|
| Content | `#0891B2` cyan |
| Pricing | `#D97706` amber |
| Policy | `#7C3AED` violet |
| Feature | `#059669` green |
| Announce | `#BE185D` pink |
| Deadline | `#DC2626` red |

### Typography
- **Inter** — UI text (300–800 weights)
- **JetBrains Mono** — Code, technical labels

### Components
- **Cards**: 14px radius, 1px border, subtle hover shadow
- **Buttons**: 10px radius, primary = near-black solid
- **Inputs**: 10px radius, subtle focus ring
- **Animation**: `cubic-bezier(0.16, 1, 0.3, 1)` easing

## 💰 Cost Analysis

### Startup (Free Tier)
- **Supabase Free**: $0 (500MB DB, 50K MAU)
- **BrightData**: Free trial credits
- **Groq Free**: 30 RPM, ~500K tokens/day
- **Resend Free**: 3,000 emails/month
- **Vercel Hobby**: $0

### At Scale (100 users × 5 URLs/day)
| Service | Cost |
|---------|------|
| Supabase Pro | $25 |
| BrightData (~15K pages) | $30–50 |
| Groq AI (~500K tokens) | $0.05–0.10 |
| Resend (over free) | $0–20 |
| Vercel | $0–20 |
| **Total** | **$55–115/month** |

## 🔒 Security

- **Row Level Security (RLS)** on all tables — users only see their own data
- **Service role keys** never exposed to client
- **Secrets stored** in Supabase Vault / Edge Function secrets
- **HTTPS only** for all external API calls
- **Input validation** on all endpoints
- **CSRF protection** via Supabase Auth cookies

## 📄 License

MIT License — see LICENSE file

## 🤝 Support

For questions or issues:
1. Check the documentation in this README
2. Review the database schema in `supabase/schema.sql`
3. Check Edge Function logs in Supabase dashboard

---

Built with 🐧 by Kin Team

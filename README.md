# Clartech Growth Agent 🚀

**Autonomous AI Outbound Council for B2B Lead Discovery, Intelligence & Pipeline Automation**

Clartech Growth Agent is a full-stack, AI-powered outbound sales orchestration platform designed to replace bulk email spamming with high-intent, account-based outreach. Powered by Google Gemini 2.5 and built with React, Vite, Express, and TypeScript, the system deploys a coordinated council of specialized AI agents to discover, research, analyze, and engage high-value prospects.

---

## 🌟 Key Features

### 🤖 5-Agent Autonomous Sales Council
1. **Prospecting Agent**: Discovers high-fit B2B target companies matched against Clartech's target industries and ideal customer profiles.
2. **Deep Research Agent**: Crawls and evaluates company domain footprint, tech stack maturity, operational friction points, and assigns an **Opportunity Score**.
3. **Decision-Maker Finder**: Pinpoints key executive decision-makers (VP Ops, Head of Product, CTO, Founder) along with verified email and phone contact details.
4. **Outreach Architect**: Crafts hyper-personalized, non-templated cold emails focusing on high-ticket client acquisition ($8,000+ LTV) over spam volume.
5. **CRM & Pipeline Coordinator**: Manages status transitions, logs contact interactions, and automatically syncs live monthly discovery call booking metrics.

### 📊 Live CRM & Analytics Dashboard
- **Real-Time Discovery Call Tracking**: Auto-synced objective counter calculating booked discovery calls directly from pipeline status (`Call Scheduled`, `Engaged`, `Converted`).
- **Interactive Lead Drawer**: Inspect company analysis summaries, tech maturity diagnostics, estimated project values, and custom outreach drafts.
- **Agent Terminal Log**: Live streaming output from the AI council detailing discovery events, scoring decisions, and outreach generation logs.
- **Manual & Automated Pipeline Controls**: Add custom leads manually, trigger single-lead deep dives, or launch fully autonomous batch discovery runs.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Motion (`motion/react`), Lucide Icons
- **Backend**: Express.js server (`server.ts`), Vite middleware integration
- **AI Engine**: Google Gen AI SDK (`@google/genai`) using `gemini-2.5-flash`
- **Language**: TypeScript (End-to-End type safety)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Gemini API Key**: Obtain a key from [Google AI Studio](https://aistudio.google.com/)

### Environment Setup

1. Copy `.env.example` to create your `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Set your Gemini API key in `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Installation & Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server (runs full-stack Express + Vite on port 3000):
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`.

---

## 📦 Production Build & Deployment

### Building for Production

Compile both the client SPA bundle and the bundled CommonJS Node server:

```bash
npm run build
```

This generates:
- Client static assets in `dist/`
- Production server bundle at `dist/server.cjs`

### Running Production Server

```bash
npm start
```

### Deploying to Vercel

1. Connect your repository to **Vercel**.
2. Configure Environment Variables in the Vercel Dashboard:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
3. Configure your Custom Domain:
   - Target Domain: `growthagent.clartech.xyz`
   - CNAME Record: Point `growthagent` to `cname.vercel-dns.com`

---

## 📄 License

Developed for **Clartech** ([clartech.xyz](https://clartech.xyz)). All rights reserved.

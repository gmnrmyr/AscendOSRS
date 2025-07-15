# AscendOSRS Product Requirements Document (PRD) 🧙‍♂️📘️📈

## Executive Summary ⚔️📊🧩

AscendOSRS is the ultimate OSRS progress tracker for "altscape" enthusiasts. It allows players to track wealth, gear progression, and goal completion across multiple Old School RuneScape characters. By combining real-time Grand Exchange data, intelligent wealth logic (Platinum Tokens + Coins), and advanced analytics like time-to-goals and GP/hr estimation, AscendOSRS redefines how serious OSRS players manage their long-term progression. With multi-account support, AI insights, and intuitive dashboards, players can dominate their RuneScape journey like never before.

## Application Overview 🧭🗌🔍

### Core Purpose 🌟🎯⚖️

- Track multi-character gear and bank progress across all account types
- Calculate progression based on Platinum Tokens + Gold, not entire bank value
- Visualize time to achieve gear goals based on current GP/hr
- Offer real-time insights, recommended purchases, and next best upgrades
- Integrate with RuneLite and OSRS APIs for seamless data sync

### Main Pages 📅

- **Summary**: Overview of progress, earnings, gold, and goals
- **Characters**: Details per account (Total Level, CB Level, total XP, bank)
- **Methods**: Assigned GP/hr methods per character
- **Goals**: Gear targets with priority and time-to-goal
- **Bank**: Synced/imported bank data (via RuneLite)
- **Data**: CSV export/import, version control, backups

### Target Audience 🏋️‍♂️💬👥

- **Primary**: Multi-account players and high-effort Ironmen
- **Secondary**: PvM-focused endgame players
- **Tertiary**: Casual OSRS players interested in structured goal-setting

## Technical Architecture 🧱️🛠️💻

### Frontend Stack 🖌️👨‍💻

- React 18 + TypeScript
- TailwindCSS + Brutalist layout, OSRS-themed
- Vite for optimized builds
- Mobile-first responsive UI

### Backend Stack 🪧🚀

- Firebase (Auth, Firestore, Hosting)
- OSRS Wiki API for GE prices and metadata
- Cloud Functions for calculation logic (time-to-goal, GP/hr)

### Infrastructure 🌐📆

- **Production**: ascendosrs.com
- **Staging**: beta.ascendosrs.com
- **CI/CD**: GitHub → Vercel
- **Backups**: Firestore version history + JSON export (manual/auto)

## Core Features 📊🔥📈

### 1. Gear Progression System 🪓🛡️

- Visualize progress from bronze to BiS
- Full gear DB including PvM, Fashionscape, Barrows, Raids, 3rd Age
- Smart visual tracking of ownership vs. target gear
- Tier goals (S+, S, A) for prioritization

### 2. Platinum Tokens + Gold Logic 💵🪙

- Users input bank or import via RuneLite
- System detects Platinum Tokens + Coins only
- Uses total gold (not total bank value) for calculating progress
- Sums gold from all characters to define "available" wealth for goals

### 3. Real-Time Wealth & Progress Tracking 📃📊

- Grand Exchange sync for real-time item valuation
- Portfolio view: total gold + bank per account
- Overall progress = gold owned / total goals value
- Visual completion bars, % indicators per goal

### 4. Multi-Character Management 👥📒

- Unlimited account tracking
- CB level, total XP, GP/hour, current gear
- Assign methods and goals per character

### 5. Methods Page (GP/hr Estimation) 📈💰

- Assign money-making methods per character
- Custom GP/hr inputs or use predefined database
- Estimate daily/monthly income
- Method Requirements (e.g., 92 Mining)

### 6. Goals Page 📊🌟

- Track 30+ gear goals
- Visual bars: current gold vs cost
- Time-to-completion based on GP/hr
- Auto-recommendations via AI (e.g., "You can afford Infernal Cape now")

### 7. RuneLite CSV Import 📆🔄

- Import banks from RuneLite's Data Exporter
- Detects item ID, quantity, GE price
- Manual override + bulk price update tools

### 8. AI Insights 🧐🔮

- Intelligent analysis of player goals and income
- Recommends next best purchase
- Provides motivational feedback and suggestions

## Monetization Strategy 💳📊

### Plans Table

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | Basic tracking, RuneLite import, ads post-BETA |
| Premium | $10/month | No ads, AI insights, advanced analytics, priority support |
| Founder | $299 | Lifetime Premium, VIP support, early access |

### Revenue Logic

- Stripe-based recurring payments
- Firebase stores user plan type, expiration
- Founder status is permanent with badge
- Ads shown only to Free users (after BETA ends)

## Tier System & Progression 🏆🔼📈

- **Gold Progress**: Based on gold/tokens vs. total goal value
- **Fashionscape Tiers**: Based on rare item collections
- **Leaderboard (future)**: Rank users by net worth, gear, time played

## Dashboard Overview 📄

### Summary Page UI (Beta Preview)

- **Email/Login**: ascendosrs.adm@gmail.com
- **Characters**: 4
- **Bank Sum**: 3.5B GP
- **Gold (Plats+Coins)**: 308.9M GP
- **Current GP/hr**: 1.4M/hr
- **Goals Total**: 7.3B GP
- **Time to Completion**: 5 years

### Top AI Insights

- "You can afford Infernal Cape now."
- "You're ready for end-game content: Twisted Bow, Scythe."
- "Ancestral robes set is only 11 days away."

### Character Breakdown

- **Lazy Priest**: 3.2B GP, Total LVL 2277
- **Lazy Jr**: 262.9M GP, Total LVL 971
- **CoffeePriest**: 98.3M GP, Total LVL 851

### Method Summary

- 3 characters earning 400K/hr via Amethyst Mining
- 1 earning 200K/hr via Yews

## Known Technical Challenges ⛔️🪧

- RuneLite file parsing inconsistencies
- Real-time GE sync has slight delays
- Manual price overrides need user alerts
- XP/hiscores data limited for Ironman/Group modes

## KPIs (Key Metrics) 📊📊📈

- Daily Active Users (DAU)
- Premium Conversions
- Average Gold Progress Rate
- Goal Completion %
- Total Founder Plans Activated
- RuneLite Import Success Rate

## Roadmap 🛏️🚪

### Phase 1: ✅ BETA

- Dashboard, Goals, RuneLite Import
- Platinum Token+Gold Logic
- GP/hr Assignments

### Phase 2: 🔄 Premium Launch

- AI Insights
- Advanced Filters and Search
- PWA (Progressive Web App)
- Easy onboarding with demo acc edits
- Mobile Support

### Phase 3: 🌐 Scaling

- RuneLite plugin for live sync
- Group Tracker (teams, clans)
- Animations & Design improvements (ex: mining amethyst pixel art animation when its active)
- Pets as goals
- Ironman logic (different since ironman won't use gold to purchase goals.)
- test.ascendosrs.com with proper cicd for both test and prod. backups for database and everything needed. prob use vercel and dbeaver later.
- cms.ascendosrs.com to control functionality, create premium codes, see logs, manage subscripbtions, payments and etc.
- google ads integration (for freemium models if available)
- SEO double check and analysis

## Admin Tools 📂⚙️

- Manage User Tiers and Plans
- Hotfix Items/Prices
- Monitor Import Logs
- Adjust Founder Access
- Campaign Tracker for Beta Users

## Conclusion 📆💪

AscendOSRS combines the addictive nature of RuneScape with a polished tracking experience for the modern altscape player. With clear insights, automated wealth logic, and serious analytics, Ascend empowers users to play smarter, track better, and flex harder. As the platform matures, it aims to become the standard for progression tracking in the OSRS community.

---

*© 2025 AscendOSRS. Not affiliated with Jagex or RuneLite. Made by players, for players.*
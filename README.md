# AscendOSRS 🧙‍♂️📈

> The ultimate OSRS progress tracker for altscape enthusiasts

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#)

> **Status: not the latest version.** This is the public snapshot from mid-2025. Development continues in a private, local-first version that runs on my own machine, and the hosted demo is offline.

AscendOSRS redefines how serious Old School RuneScape players manage their long-term progression across multiple accounts. Track wealth, gear progression, and goal completion with real-time Grand Exchange data, intelligent wealth calculations, and AI-powered insights.

## ✨ Features

### 🏦 **Intelligent Wealth Tracking**
- **Platinum Tokens + Gold Logic**: Focus on liquid wealth, not total bank value
- **Multi-Account Portfolio**: Aggregate wealth across all your characters
- **Real-time GE Integration**: Live item valuations from OSRS Wiki API

### ⚔️ **Gear Progression System**
- **Complete Gear Database**: From bronze to BiS, including PvM, Fashionscape, Barrows, Raids, and 3rd Age
- **Visual Progress Tracking**: See your journey from starter gear to endgame
- **Smart Tier Goals**: S+, S, A priority system for optimal progression

### 📊 **Advanced Analytics**
- **Time-to-Goal Estimation**: Know exactly when you'll afford that Twisted Bow
- **GP/hr Method Tracking**: Assign and monitor money-making methods per character
- **AI Insights**: Get intelligent recommendations for your next best purchase

### 🔄 **RuneLite Integration**
- **CSV Import**: Seamlessly import bank data from RuneLite's Data Exporter
- **Automated Detection**: Smart parsing of item IDs, quantities, and prices
- **Manual Overrides**: Fine-tune your data when needed

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/gmnrmyr/AscendOSRS.git
cd AscendOSRS

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **TailwindCSS** with brutalist OSRS-themed design
- **Vite** for optimized builds
- **Mobile-first** responsive UI

### Backend
- **Supabase** (Auth, Database, Real-time)
- **OSRS Wiki API** for Grand Exchange data
- **Edge Functions** for calculation logic

### Infrastructure
- **Production**: [ascendosrs.com](https://ascendosrs.com/)
- **CI/CD**: GitHub → Vercel
- **Database**: PostgreSQL via Supabase

## 📱 Core Pages

| Page | Description |
|------|-------------|
| **Summary** | Overview of progress, earnings, and goals |
| **Characters** | Detailed per-account statistics and gear |
| **Methods** | GP/hr tracking and money-making assignments |
| **Goals** | Gear targets with priority and time estimates |
| **Bank** | RuneLite import and wealth visualization |
| **Data** | CSV export/import and backup management |

## 💎 Monetization

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | Basic tracking, RuneLite import |
| **Premium** | $10/month | No ads, AI insights, advanced analytics |
| **Founder** | $299 | Lifetime Premium + VIP benefits |

## 🎯 Target Audience

- **Primary**: Multi-account players and high-effort Ironmen
- **Secondary**: PvM-focused endgame players
- **Tertiary**: Casual players interested in structured goal-setting

## 📈 Development Roadmap

### Phase 1: ✅ BETA (Current)
- [x] Dashboard and Goals system
- [x] Platinum Token + Gold logic
- [x] RuneLite CSV import
- [x] GP/hr method assignments

### Phase 2: 🔄 Premium Launch
- [ ] AI insights and recommendations
- [ ] Advanced filtering and search
- [ ] Progressive Web App (PWA)
- [ ] Enhanced mobile support

### Phase 3: 🌐 Scaling
- [ ] RuneLite plugin for live sync
- [ ] Group/Clan tracking features
- [ ] Ironman-specific logic
- [ ] Pets as trackable goals
- [ ] Admin CMS panel

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Access
Need Supabase dev access? Send your email to request access to the database dashboard.

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📊 Key Metrics

- Daily Active Users (DAU)
- Premium conversion rate
- Goal completion percentage
- RuneLite import success rate
- Average wealth progression

## 🐛 Known Issues

- RuneLite file parsing inconsistencies
- Slight delays in real-time GE sync
- Limited XP/hiscores data for Ironman modes
- Manual price overrides need user alerts

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE).

## ⚠️ Disclaimer

AscendOSRS is not affiliated with Jagex or RuneLite. Made by players, for players.

## 🙏 Acknowledgments

- OSRS Wiki for Grand Exchange API
- RuneLite community for CSV export functionality
- OSRS community for feedback and support

---

**Built with ❤️ for the OSRS community**

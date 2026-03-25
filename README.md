# ☁️ SubManager - Cloud Subscription Management

A comprehensive subscription management application with **cloud synchronization**, **AI-powered insights**, multi-language support, currency conversion, and analytics.

## ✨ Latest Updates - v2.1 AI Edition

🎉 **NEW:** AI-powered features using TensorFlow.js!

- 🤖 **AI Spending Predictions** - ML-based forecast of future expenses
- 📧 **Email Parsing** - Auto-extract subscriptions from emails
- 💡 **Smart Recommendations** - AI-powered savings suggestions
- 🔒 **Privacy-First** - All AI runs locally in your browser
- ✅ **Works in Russia** - No VPN required, completely offline-capable

**[→ Activate AI Features (30 seconds)](/START_HERE_AI.md)**

### Previous Updates - v2.0 Cloud Edition

- ☁️ **Cloud Storage** - Never lose your data again
- 🔄 **Multi-Device Sync** - Access from anywhere
- 🔐 **Secure** - Protected with Row Level Security
- 💾 **Auto Backup** - Your subscriptions are safe

**[→ How to Activate Cloud Sync (5 min)](/КАК_АКТИВИРОВАТЬ_ОБЛАКО.md)**

---

## 🚀 Quick Start

### Option 1: Demo Account (No Setup Required)
For instant access without any registration:
- **Email**: `demo@submanager.app`
- **Password**: `админ0`

Click the **"🔑 Demo Login"** button on the login page.

> **Note**: Demo account uses local storage (no cloud sync)

### Option 2: Create Your Own Account (Recommended)
1. Click **"Sign Up"** from the login page
2. Fill in your name, email, and password (minimum 6 characters)
3. Confirm your password
4. You'll be automatically logged in
5. **[Activate Cloud Sync](/КАК_АКТИВИРОВАТЬ_ОБЛАКО.md)** (5 minutes)

---

## 📊 Features

### 🔐 Authentication & Cloud Sync
- ✅ **User Registration & Login** via Supabase Auth
- ✅ **Cloud Synchronization** - Data automatically syncs across devices
- ✅ **Secure Storage** - Row Level Security protects your data
- ✅ **Sync Status Indicator** - Visual feedback in sidebar

### 📝 Subscription Management
- **Centralized Dashboard** - View all active subscriptions
- **Full CRUD Operations** - Add, edit, delete subscriptions
- **Categories** - Streaming, Software, Delivery, Cloud, Education, and more
- **Billing Tracking** - Monthly/yearly cycles and next billing dates
- **Status Management** - Active/inactive subscription states

### 📈 Analytics & Insights
- **Spending Analytics** - Visualize spending by category (pie charts)
- **Trend Analysis** - View spending trends over time (line charts)
- **Top Subscriptions** - See most expensive subscriptions (bar charts)
- **Yearly Forecast** - Project annual subscription costs
- **Monthly Totals** - Track your recurring expenses
- **🤖 AI Predictions** - ML-powered spending forecasts (NEW!)

### 🤖 AI Features (TensorFlow.js)
- **Email Parsing** - Automatically extract subscriptions from emails
- **Spending Predictions** - ML-based forecast for next month
- **Smart Insights** - AI-generated recommendations
- **Category Analysis** - Automatic spending breakdown
- **Savings Potential** - Calculate possible savings
- **Works Offline** - All AI runs locally in browser
- **Privacy-First** - No data sent to external servers

### 💡 Smart Features
- **Alternative Recommendations** - Find cheaper alternatives
- **Upcoming Billing Alerts** - See renewals in next 7 days
- **Cost Savings Calculator** - Calculate potential savings
- **Currency Conversion** - Real-time price conversion

### 🎨 Customization
- **Multi-Language Support** 
  - 🇷🇺 Russian (Русский)
  - 🇬🇧 English
  - 🇧🇾 Belarusian (Беларуская)
  - 🇨🇳 Chinese (中文)

- **Multi-Currency** with auto-conversion
  - ₽ RUB (Russian Ruble)
  - $ USD (US Dollar)
  - € EUR (Euro)
  - ¥ CNY (Chinese Yuan)
  - Br BYN (Belarusian Ruble)

- **Font Size Options**: Small, Medium, Large

- **Theme Switcher**
  - 🌙 **Dark Theme**: Orange & Black
  - ☀️ **Light Theme**: Purple, Orange & White
  - Animated sun/moon toggle

---

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router v7 (Data Mode)
- **Styling**: Tailwind CSS v4
- **Animations**: Motion (Framer Motion)
- **Charts**: Recharts
- **AI/ML**: TensorFlow.js 4.22.0
  - Local machine learning
  - Email parsing & NLP
  - Spending predictions
  - No external API required
- **Backend**: Supabase
  - Authentication (Supabase Auth)
  - Database (PostgreSQL)
  - Row Level Security
- **State Management**: React Context API
- **Notifications**: Sonner
- **Icons**: Lucide React

---

## 📖 Documentation

### AI Features (NEW!)
- 🤖 **[AI Quick Start (30s)](/START_HERE_AI.md)** - Activate AI features
- 📚 **[AI Guide](/AI_README.md)** - Complete TensorFlow.js documentation
- ⚡ **[AI Activation](/AI_QUICK_START.md)** - Step-by-step activation
- 🇷🇺 **[Russia Setup](/RUSSIA_QUICK_FIX.md)** - Works without VPN
- ✅ **[AI Complete](/AI_TENSORFLOW_COMPLETE.md)** - Implementation details

### Quick Guides
- 🚀 **[5-Minute Cloud Setup](/КАК_АКТИВИРОВАТЬ_ОБЛАКО.md)** - Activate cloud sync (Russian)
- ⚡ **[Quick Database Setup](/QUICK_DATABASE_SETUP.md)** - Activate cloud sync (English)
- 📘 **[Quick Start Guide](/БЫСТРЫЙ_СТАРТ.md)** - User guide (Russian)

### Technical Documentation
- 🗄️ **[Database Setup](/supabase/SETUP_DATABASE.md)** - Detailed database instructions
- ☁️ **[Cloud Storage Guide](/ОНЛАЙН_СОХРАНЕНИЕ.md)** - Complete cloud sync documentation (Russian)
- 📝 **[Setup Complete](/SETUP_COMPLETE.md)** - Checklist and troubleshooting
- 📋 **[Changelog](/CHANGELOG_CLOUD_SYNC.md)** - Version 2.0 changes

---

## 🎯 Getting Started

### Step 1: Create Account
1. Sign up with email and password
2. Automatically logged in after registration

### Step 2: Activate Cloud Sync (One-Time Setup)
1. Open [Supabase SQL Editor](https://app.supabase.com/project/echbyusirwoojodjhhzi/sql/new)
2. Copy SQL from `/supabase/migrations/001_initial_schema.sql`
3. Run the query
4. **Done!** ✅ Cloud sync is now active

> **Detailed instructions:** See [КАК_АКТИВИРОВАТЬ_ОБЛАКО.md](/КАК_АКТИВИРОВАТЬ_ОБЛАКО.md)

### Step 3: Start Using
1. **Add Subscriptions** - Click "+ Add Subscription"
2. **Customize Settings** - Change language, currency, theme
3. **View Analytics** - Check spending patterns
4. **Find Alternatives** - Click 💡 icon for cheaper options

---

## 📱 Pages Overview

- **🔐 Login/Signup** - User authentication
- **📊 Dashboard** - Overview with upcoming billings
- **💳 Subscriptions** - Full list with search and filters
- **📈 Analytics** - Visual charts and insights
- **⚙️ Settings** - Customize app preferences

---

## 🔄 Sync Status Indicators

Look for these in the sidebar:

- **☁️ Cloud Synced** (green) - Data saved to cloud
- **🔄 Syncing...** (blue) - Saving in progress
- **📱 Local Storage** (orange) - Demo account (no sync)

---

## 💾 Data Structure

Each subscription includes:
- **Name** - Service name (e.g., "Netflix")
- **Category** - Type of service
- **Price** - Cost in selected currency
- **Billing Cycle** - Monthly or Yearly
- **Next Billing** - Date of next charge
- **Status** - Active or Inactive

---

## 🔐 Security

- ✅ **Supabase Auth** - Industry-standard authentication
- ✅ **Row Level Security** - Database-level protection
- ✅ **Encrypted Passwords** - Never stored in plain text
- ✅ **User Isolation** - Each user sees only their data
- ✅ **HTTPS** - All connections encrypted

---

## 🌍 Currency Exchange Rates

Automatic conversion using these rates:
- 1 USD = 80 RUB
- 1 EUR = 95 RUB
- 1 CNY = 12 RUB
- 1 BYN = 27 RUB

All prices automatically recalculate when you change currency.

---

## 🆚 Version Comparison

| Feature | v1.0 | v2.0 (Current) |
|---------|------|----------------|
| Storage | localStorage | ☁️ Supabase Cloud |
| Multi-Device | ❌ No | ✅ Yes |
| Sync | ❌ No | ✅ Automatic |
| Backup | ❌ No | ✅ Automatic |
| Security | Browser | ✅ RLS + Auth |

---

## 🐛 Troubleshooting

### "Local Storage" instead of "Cloud Synced"?
- Check if database migration was applied
- See: [КАК_АКТИВИРОВАТЬ_ОБЛАКО.md](/КАК_АКТИВИРОВАТЬ_ОБЛАКО.md)

### Data not syncing between devices?
- Ensure you're using the same email/password
- Verify "Cloud Synced" status in sidebar
- Check browser console (F12) for errors

### Support chat error: "infinite recursion detected"?
- **Quick Fix:** [СРОЧНОЕ_ИСПРАВЛЕНИЕ.md](/СРОЧНОЕ_ИСПРАВЛЕНИЕ.md) (2 minutes)
- **Detailed Guide:** [README_RECURSION_FIX.md](/README_RECURSION_FIX.md)
- **All Documentation:** [INDEX_RECURSION_FIX.md](/INDEX_RECURSION_FIX.md)

### Need more help?
- 📚 Check documentation files
- 🔍 Look in `/SETUP_COMPLETE.md` for common issues

---

## 🎨 Design

### Dark Theme (Default)
- Primary: Orange (#FF6B35)
- Accent: Dark Orange (#F7931E)
- Background: Black/Dark Gray

### Light Theme
- Primary: Purple (#8B5CF6)
- Accent: Orange (#F59E0B)
- Background: White/Light Gray

**Toggle**: Click sun/moon icon in top-right

---

## 🔮 Future Enhancements

- [ ] Automatic localStorage migration to cloud
- [ ] Email notifications for upcoming billings
- [ ] Payment integration (Russian systems)
- [ ] Mobile app (iOS/Android)
- [ ] Data export (CSV/Excel)
- [ ] Subscription sharing with family
- [ ] Budget limits and alerts

---

## 📄 License

Built with ❤️ using Figma Make

---

## 🙏 Powered By

- [Supabase](https://supabase.com) - Cloud database & auth
- [React](https://react.dev) - UI framework
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Recharts](https://recharts.org) - Data visualization

---

**Start managing your subscriptions smarter today! ☁️✨**

> **Quick Start**: [Activate Cloud Sync in 5 Minutes](/КАК_АКТИВИРОВАТЬ_ОБЛАКО.md)
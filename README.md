# 🇵🇰 Mera Pakistan – Cultural & Heritage Exploration Platform

A full-stack monorepo web platform for exploring Pakistan's regional culture, historical landmarks, and culinary heritage — built with a dual-backend architecture and end-to-end type safety.

## ✨ Features

- 🏛️ **Heritage Explorer** – Browse historical landmarks and cultural sites across Pakistan
- 🍛 **Culinary Heritage** – Discover regional cuisine and food culture
- 🌍 **Regional Culture Hub** – Explore culture by region/province
- 🔗 **Dual-Backend Architecture** – Node.js and FastAPI working together for different services
- ✅ **End-to-End Type Safety** – OpenAPI-driven types shared across frontend and backend
- 🧪 **Automated Testing** – Pytest test suite structured with Page Object Model (POM)

## 🛠️ Tech Stack

**Frontend:** React (Vite), TypeScript  
**Backend:** Node.js, FastAPI (Python)  
**API Contract:** OpenAPI  
**Testing:** Pytest, Page Object Model (POM)  
**Package Management:** pnpm (monorepo workspace)  
**Version Control:** Git

## 📂 Project Structure

```
Mera-Pakistan/
├── artifacts/     # Build/generated artifacts
├── lib/            # Shared libraries/utilities
├── scripts/        # Automation & setup scripts
├── tests/          # Pytest test suite (POM structure)
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.json
```

## ⚙️ Installation & Setup

```bash
# Install dependencies (monorepo)
pnpm install

# Set up environment variables
cp .env.example .env

# Seed the database (Windows)
./seed-database.bat

# Run the app
pnpm dev
```

## 🧪 Running Tests

```bash
cd tests
pytest
```

## 🚀 How It Works

1. Frontend (React + Vite + TypeScript) consumes APIs from both Node.js and FastAPI backends
2. OpenAPI specs ensure type safety end-to-end — no mismatched request/response shapes
3. Automated Pytest suite (using Page Object Model) validates key user flows
4. pnpm workspace manages the monorepo's shared packages efficiently

## 📌 Future Improvements

- Add CI/CD pipeline for automated testing on push
- Expand cultural database with more regions
- Add multilingual support (Urdu/English)

## 👤 Author

**Rayyan Wamiq**  
[GitHub](https://github.com/Rayyan-Wamiq) | [LinkedIn](https://www.linkedin.com/in/rayyan-wamiq-880244415)

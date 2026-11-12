# SAHAYAK (सहायक) 🇮🇳

> **An AI-Assisted Government Welfare Discovery & Application-Readiness Platform for Indian Citizens**

---

## 🌟 Executive Vision

Millions of Indian citizens miss out on life-changing welfare schemes due to information asymmetry, complex eligibility rules, and lack of document readiness.

**Sahayak** bridges this gap. Unlike traditional scheme directories, Sahayak guides applicants through an end-to-end 5-stage readiness journey:

```
[ 1. Potential Eligibility ] 
            │
            ▼
[ 2. Requirement Understanding ]
            │
            ▼
[ 3. Document Readiness ]
            │
            ▼
[ 4. Personalised Action Plan ]
            │
            ▼
[ 5. Application Preparation & Tracking ]
```

---

## 🚀 Core Features (MVP)

- **Deterministic Rule Engine (No Black-Box AI for Eligibility):** Pure, testable TypeScript rule engine evaluating conditions mathematically and returning `POTENTIALLY_ELIGIBLE`, `NOT_ELIGIBLE`, or `INSUFFICIENT_INFORMATION`.
- **Explainable Outcomes:** Clear audit breakdowns showing every passed condition, failed condition, and missing profile attribute.
- **Universal Document Taxonomy & Vault:** Records your certificates once (Income, Domicile, Caste, Ration Card) and maps availability across all schemes.
- **Cross-Scheme Document Intelligence:** Calculates high-leverage documents that unlock multiple schemes at once.
- **Application Readiness Dashboard:** Visual readiness score (%) with actionable next steps before heading to official portals or Citizen Service Centres (CSC).
- **Curated Verified Data:** Zero fake schemes. Only verified Central and State initiatives with official links and verification timestamps.
- **Privacy-First (Zero-Aadhaar):** No 12-digit Aadhaar collection, no identity document scans on servers, protected by PostgreSQL Row Level Security (RLS).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18, Vite 5, TypeScript 5 (Strict Mode) |
| **Styling & Design System** | Tailwind CSS 3, Lucide React (Accessible Civic-Tech Theme) |
| **Routing & Navigation** | React Router DOM v6 |
| **Forms & Validation** | React Hook Form, Zod |
| **Backend & Database** | Supabase (PostgreSQL 15, Supabase Auth, Row Level Security) |
| **Edge & AI Assistant** | Supabase Edge Functions (Deno / TS) + Grounded LLM Context |

---

## 📁 Scalable Folder Structure

```
src/
├── assets/                  # Static assets and branding
├── components/
│   ├── ui/                  # Reusable accessible UI primitives (Button, Card, Badge, Input, Select)
│   └── layout/              # Navbar, Footer, PublicLayout, DashboardLayout
├── data/                    # Domain constants (Indian States, UTs, categories, options)
├── features/                # Domain feature modules
│   ├── auth/                # Supabase authentication workflows (Phase 2)
│   ├── onboarding/          # Progressive profiling questionnaire (Phase 2)
│   ├── schemes/             # Scheme directory & faceted filtering (Phase 3)
│   ├── eligibility/         # Rule engine condition audit UI (Phase 2 & 3)
│   ├── documents/           # Document vault & cross-scheme matrix (Phase 3)
│   ├── dashboard/           # Readiness score & task progress (Phase 4)
│   └── admin/               # Scheme curation and verification panel (Phase 5)
├── hooks/                   # Custom application hooks
├── lib/
│   ├── env.ts               # Type-safe environment variables with Zod
│   ├── supabase.ts          # Supabase client singleton
│   └── utils.ts             # Tailwind class merge (cn), INR currency & date formatters
├── pages/                   # Routed application pages
│   ├── LandingPage.tsx      # Public landing page & 5-step flow explainer
│   ├── AuthPage.tsx         # Sign in / Register / Magic Link
│   ├── OnboardingPage.tsx   # Progressive eligibility intake questionnaire
│   ├── SchemesExplorePage.tsx # Scheme directory with faceted filters
│   ├── SchemeDetailPage.tsx # Scheme details & explainable rule audit
│   ├── DocumentVaultPage.tsx# Universal Document Vault
│   ├── DashboardPage.tsx    # Citizen application readiness dashboard
│   ├── SavedSchemesPage.tsx # Bookmarked schemes
│   ├── TasksPage.tsx        # Application task & milestone tracker
│   ├── ProfilePage.tsx      # Citizen demographic profile settings
│   ├── AssistantPage.tsx    # Grounded AI Scheme Assistant
│   ├── AdminPage.tsx        # Scheme curation management panel
│   └── NotFoundPage.tsx     # 404 page
├── routes/
│   └── AppRoutes.tsx        # Central route definitions
├── services/                # Business services & rule engine
├── styles/
│   └── globals.css          # Tailwind directives & civic base typography
├── types/                   # TypeScript domain interfaces
│   ├── scheme.types.ts      # Schemes, rule grammar & evaluation contracts
│   ├── user.types.ts        # Demographic profile schemas
│   ├── document.types.ts    # Universal document taxonomy & readiness
│   └── index.ts             # Central type exports
├── App.tsx                  # Root component
└── main.tsx                 # DOM entry point
```

---

## 💻 Getting Started Locally

### 1. Prerequisites
- **Node.js:** v18.0.0 or higher (Tested on Node v24)
- **npm:** v9.0.0 or higher

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/sahayak.git
cd sahayak
npm install
```

### 3. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
*(Default placeholder credentials are automatically provided for local development. Real Supabase credentials can be added when deploying).*

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Running Automated Test Suites
Sahayak features 6 comprehensive, automated test suites (over 100 assertions):
```bash
# Run all test suites
npm run test

# Run individual domain suites
npm run test:eligibility   # Deterministic eligibility evaluation engine
npm run test:documents     # Cross-scheme deduplication & readiness meter
npm run test:dashboard     # Applicant profile, readiness, & application tracker
npm run test:assistant     # RAG context retrieval, source citations, & fallback
npm run test:admin         # RBAC, audit logging, & statutory publication guardrails
npm run test:qa            # Complete 15-step functional user journey & 6 edge cases
```

### 6. Running Type Checks & Production Build
```bash
# Strict TypeScript validation
npm run type-check

# Optimized production build with vendor chunking
npm run build
```

---

## 📚 Technical Documentation & Deployment

- [Production Deployment Guide (DEPLOYMENT.md)](DEPLOYMENT.md)
- [System Architecture Specification (ARCHITECTURE.md)](ARCHITECTURE.md)
- [21-Day Phased Implementation Plan (PROJECT_PLAN.md)](PROJECT_PLAN.md)

---

## ⚖️ Public Notice

Sahayak is an independent civic-tech welfare discovery and readiness tool. It is not affiliated with or endorsed by the Government of India or any State Government. All applications must be submitted directly through official government portals.

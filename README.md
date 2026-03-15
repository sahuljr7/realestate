# Real Estate Marketplace

A modern real estate marketplace frontend built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, and Recharts.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand (with localStorage persistence)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Testing**: Vitest + fast-check (property-based testing)

## Features

- **Property Search** — Search by city/locality with autocomplete, filter by BHK, price range, type, furnishing, and more
- **Property Listings** — Paginated grid with sort, filter sidebar (desktop panel / mobile drawer)
- **Property Detail** — Image gallery, full details, EMI calculator, contact form, similar properties
- **Localities** — Browse localities with price trend charts (12-month history)
- **Price Trends** — Compare up to 3 localities side-by-side, avg price by property type
- **Home Loan Tools** — EMI calculator, loan eligibility calculator, prepayment calculator
- **Interior Design** — Designer directory, budget estimator, quote request form
- **Post Property** — Multi-field form with photo upload and live preview
- **Dashboard** — Saved properties, recently viewed, contacted properties tabs

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home
│   ├── properties/         # Listings + detail
│   ├── localities/         # Locality list + detail
│   ├── trends/             # Price trends
│   ├── tools/              # Home loan tools
│   ├── interior/           # Interior design
│   ├── post-property/      # Post a property
│   └── dashboard/          # User dashboard
├── components/
│   ├── ui/                 # Badge, Skeleton, Modal, BlogCard
│   ├── layout/             # Navbar, Footer, BottomNav
│   ├── search/             # SearchBar
│   ├── property/           # PropertyCard, FilterSidebar, PropertyGallery
│   ├── locality/           # LocalityCard, TrendChart
│   ├── tools/              # EMI, Eligibility, Prepayment calculators
│   ├── forms/              # ContactForm, QuoteForm
│   └── dashboard/          # DashboardTabs
├── data/                   # JSON data files (properties, localities, agents, blogs)
├── hooks/                  # Data-access hooks
├── lib/                    # Utility functions (filters, calculators, formatters)
├── services/               # Data service layer
├── store/                  # Zustand store
├── types/                  # TypeScript interfaces
└── __tests__/              # Property-based tests
```

## Running Tests

```bash
npm run test
```

Tests use [fast-check](https://github.com/dubzzz/fast-check) for property-based testing across filters, calculators, store logic, and data schemas.

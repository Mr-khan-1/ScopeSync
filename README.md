# ScopeSync

ScopeSync is a local-first, AI-powered scope and boundary management tool for freelancers and agencies. It takes messy client communications (Slack threads, emails) and extracts a structured, professional scope agreement. 

## Features
- **AI Scope Extraction:** Paste unstructured text and instantly receive in-scope, out-of-scope, and assumptions.
- **BYOK (Bring Your Own Key):** Users configure their own Gemini API key, ensuring data privacy and decentralized API costs.
- **Agency Identity:** Add a custom company name and upload a company stamp for professional, generated PDF agreements.
- **Smart Change Requests:** When clients request a change to a locked scope, AI determines if it's in-scope or out-of-scope based on the locked agreement and calculates the budget impact.
- **Project Budgeting:** Support for both hourly rates and fixed total budgets, with granular item-level pricing.
- **PDF Generation:** Instantly generate and download a formal PDF record of the signed agreement.
- **Resilient Offline Architecture:** 100% local-first storage using robust `localStorage` wrappers with error boundaries.

## Getting Started
1. Run `npm install` to install dependencies.
2. Run `npm run dev` to start the development server.
3. Open `http://localhost:3000` and go to **Settings** to add your Gemini API Key.
4. Go to **New Scope** and paste a sample project brief to see the magic in action.

## Tech Stack
- Next.js 14 (App Router)
- React & TailwindCSS
- Google Generative AI (Gemini 1.5 Flash)
- React PDF Renderer
- Playwright & Vitest for Testing

<div align="center">
  <br />
  <h1>ScopeSync</h1>
  <p>
    <strong>A local-first, AI-powered scope and boundary management tool for freelancers and agencies.</strong>
  </p>
  <p>
    <a href="https://scope-sync-one.vercel.app/" target="_blank">View Live Demo</a>
  </p>
  <br />
</div>

ScopeSync takes messy client communications—like scattered Slack threads, vague emails, and rough meeting notes—and instantly extracts a structured, professional scope agreement. It protects your boundaries, eliminates scope creep, and keeps everyone aligned.

## ✨ Features

- **🧠 AI Scope Extraction:** Paste unstructured text and instantly receive perfectly categorized in-scope deliverables, out-of-scope exclusions, and key assumptions.
- **💰 Budget Management:** Flexible support for both hourly rates and fixed total budgets.
- **🛡️ Smart Change Requests:** When clients request changes to a locked scope, AI instantly analyzes the request, determines if it's an out-of-scope addition, and calculates the budget impact.
- **📄 Professional PDF Generation:** Instantly generate and download a formal, highly compact, one-page PDF record of the signed agreement.
- **🏢 Agency & Brand Identity:** Add your custom freelancer/agency name and upload a company stamp that automatically applies to your generated PDF agreements.
- **🔑 BYOK (Bring Your Own Key):** Users configure their own Gemini API key in the browser, ensuring maximum data privacy and decentralizing API costs.
- **⚡ Resilient Offline Architecture:** 100% local-first storage using robust `localStorage` wrappers with error boundaries. No database required!

## 🚀 Getting Started

### Live Demo
Experience the tool right away at: **[https://scope-sync-one.vercel.app/](https://scope-sync-one.vercel.app/)**

### Local Installation

1. **Clone and Install**
   ```bash
   git clone https://github.com/Mr-khan-1/ScopeSync.git
   cd ScopeSync
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Configure Settings (BYOK)**
   ScopeSync uses a Bring Your Own Key (BYOK) architecture for maximum privacy. To configure:
   - 1. Get a free Gemini key at [aistudio.google.com](https://aistudio.google.com) (free, no credit card required).
   - 2. Copy your generated API key.
   - 3. Go to **Settings** in the ScopeSync app.
   - 4. Paste your key in the API Key field and save.
   - 5. Done! You can also configure your Agency name and rates here.

4. **Extract your first Scope**
   - Go to **New Scope** and paste a sample project brief to see the magic in action.

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI/Styling:** React, Tailwind CSS, Lucide Icons
- **AI:** Google Generative AI (Gemini 1.5 Flash)
- **PDF Generation:** React PDF Renderer
- **Storage:** LocalStorage (Offline-first)

## 📝 License

This project is open-source and available under the MIT License.

# Reflection

## 1. What was genuinely hardest about building this, and why?
The most difficult part of building ScopeSync was managing the complex, multi-party state machine entirely client-side without a backend database. We had to ensure that the "draft", "client_review", "freelancer_review", and "locked" states were flawlessly handled via URL sharing and `localStorage`. Managing the transition from unstructured AI data into strict state representations (and updating budgets dynamically via change orders) required highly defensive programming. When both parties are viewing the app via the same payload string in the URL but need different views (Client vs. Freelancer), abstracting that logic cleanly was a significant architectural challenge.

## 2. What would you do differently if starting over?
If I were starting over, I would implement a lightweight backend (perhaps using Supabase or Firebase) rather than relying strictly on URL-based data sharing and `localStorage`. While the offline-first approach was an excellent learning experience and provides immense privacy, the UX friction of having to "Copy Client Link" (which generates a massive URL payload) limits scalability. A database would allow for real-time multiplayer cursors, instant push notifications when a client approves a scope, and secure server-side PDF generation.

## 3. One thing that surprised you while building it
I was genuinely surprised by how capable the `@react-pdf/renderer` library is in a purely browser-based environment. Originally, I assumed generating a highly styled, professional-grade legal document (complete with embedded signature images and dynamic table rendering) would require a heavy Node.js server like Puppeteer. Instead, `@react-pdf/renderer` handled complex flexbox layouts natively in the browser without dropping frames, allowing us to keep the entire architecture decentralized.


# 🧰 LocalWebsiteAudit.ca – Technical Project Structure & Infrastructure Overview

---

## 📦 Tech Stack Summary

- **React (with TypeScript)**
- **Vite** (Build tool)
- **React Router** (Navigation)
- **Tailwind CSS** (Styling)
- **shadcn/ui** (UI components)
- **TanStack React Query** (Data fetching)
- **Lucide Icons** (Iconography)
- **Netlify** (Hosting via Git auto-publish)

---

## 🧠 Project Structure Overview

### 📁 Suggested Folder Structure
```
src/
├── assets/             # Static files (images, icons)
├── components/         # Reusable UI components (shadcn/ui, Lucide)
├── features/           # Domain-specific logic (e.g. audit, petition, signup)
│   └── audit/
│       ├── components/
│       ├── hooks/
│       └── api.ts
├── hooks/              # Global reusable hooks
├── lib/                # API clients, utility functions
├── pages/              # Route-level components
├── routes/             # React Router route definitions
├── styles/             # Tailwind and global CSS overrides
├── types/              # TypeScript types and interfaces
main.tsx                # Vite entry
App.tsx                 # App wrapper (providers, router)
```

---

## 🧭 Routing Strategy

- React Router v6+ for SPA routing
- Dynamic routes:
  - `/[businessSlug]` – Audit Page
  - `/petition/[slug]` – Social Proof Petition Page
  - `/signup` – Email/SMS opt-in
  - `/tools` – Helpful SEO tools directory
- Route definitions organized in `routes/`

---

## 🎨 Styling & Component System

- **Tailwind CSS**:
  - Custom theme via `tailwind.config.ts`
  - Extend colors, typography for a civic/trustworthy tone
- **shadcn/ui**:
  - Components like Card, Button, Input, Form, Toast, Dialog
  - Custom theming to match brand
- **Lucide Icons**:
  - Integrated as React components

---

## ⚙️ Infrastructure & Dev Setup

- **Vite**:
  - Fast builds & hot reload
  - Aliases in `vite.config.ts`:
    ```ts
    resolve: {
      alias: {
        "@components": "/src/components",
        "@features": "/src/features",
        "@hooks": "/src/hooks",
      }
    }
    ```
- **Environment Variables**:
  - `.env` for API endpoints, secrets

- **Dev Flow**:
  - Local dev: `Loveable.dev` or `Cursor`
  - Source control: GitHub
  - Hosting: Netlify (auto-deploy on push)

---

## 🔄 State Management & Data Fetching

- **TanStack React Query**:
  - `useQuery` for fetching audit data
  - `useMutation` for opt-in form submits
  - Devtools for debugging
  - Built-in caching and re-fetching
- Optional: React Context for global form state

---

## 🧪 Developer Experience

- **Tooling**:
  - ESLint + Prettier
  - Husky + lint-staged
  - TypeScript strict mode
  - Zod for form validation (shadcn integration)
- **Testing (optional)**:
  - Vitest + React Testing Library

---

## ✨ Extras to Consider

- Skeleton loaders while audit data loads
- Toast notifications for feedback
- Optimistic UI for form interactions
- Scroll/animation enhancements (Framer Motion)

---

Need help bootstrapping this as a starter template? Just holler!

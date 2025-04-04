
# LocalWebsiteAudit.ca – Project Requirements Document
**Prepared for:** Brian Lapp  
**Platform Purpose:** Neutral third-party site providing local website audits, acting as a stealth SEO lead gen funnel for Entice.

---

## 🚀 Project Overview
LocalWebsiteAudit.ca is a Canadian civic-style platform offering free web audits to small businesses. While positioned as a helpful, independent community resource, it is quietly optimized to funnel businesses into upgrading with Entice (without mentioning Entice anywhere on the site).

---

## 🎯 Core Goals
- Appear completely **neutral and helpful** (not salesy)
- **Outrank** outdated business websites using SEO-optimized pages
- Collect **email + SMS opt-ins** to show community demand
- Use **petition-style social proof** to nudge businesses
- Funnel conversions discreetly into **Entice-powered upgrades**
- Deliver useful tools to build **long-term SEO trust and value**

---

## 🧑‍💼 Target Audience
- **Small business owners** who control digital decisions  
- Industries: Restaurants, trades, clinics, retail, etc.  
- Avoid: Franchises, corporate-run websites

---

## 🌐 Site Architecture
- **React + TypeScript (Vite)**
- **React Router** for routing
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **Lucide icons**
- **TanStack React Query** for API/data fetches
- **Hosting:** Netlify via Git-based auto-publish
- **Dev environments:** Loveable.dev → Cursor (w/ Git versioning)

---

## 📄 Audit Page Layout
Each business gets a unique URL:

`/city/business-name` (e.g., `/ottawa/marios-pizza`)

Includes:
- H1: `Website Audit: Mario’s Pizza (Ottawa)`
- Meta: `"See how Mario’s Pizza in Ottawa performs in SEO, mobile responsiveness, and user design. Community feedback and improvement suggestions included."`
- **Lighthouse Data Summary**
- **Visual Design Score** (automated where possible)
- **Screenshots**: Desktop + Mobile view
- **Suggested Improvements** (auto-generated)
- **Petition Widget**:
  - Live signature tally
  - Collects name, email, optional phone (SMS opt-in)
  - Checkbox: “Notify me if this site gets upgraded”
- **Community Requested Upgrade** badge w/ signature count
- **Google Map Embed or Image**
- **NAP block** with JSON-LD schema markup

---

## 🔄 Post-Upgrade Flow
When a business upgrades:
- Their **audit score improves** (auto-refreshed)
- Petition + suggestions quietly disappear
- Page remains live but **does not mention Entice**
- Upgrade connection shown only *offline* (POS flyer) or *on the new site* via Entice badge

---

## ✉️ Business Owner CTA
Soft-touch contact options only:
- "Own this business? Contact Brian Lapp to respond or improve your website.”
- Lightweight contact form → Sends to `brian@localwebsiteaudit.ca`
- Optional Calendly link for booking

No public response or comment features to prevent chaos.

---

## 🛠 Free Tools (tools drop down in nav)
All tools are third-party embedded/wrapped APIs:

- ✅ **Website Speed Tester**
- ✅ **Mobile Friendliness Checker**
- ✅ **Meta Tag Analyzer**
- ✅ **Basic SEO Health Scan**
- ✅ **Broken Link Checker**

Tools must:
- Be usable without signup
- Be shareable
- Be branded: “Powered by LocalWebsiteAudit.ca – Built for small businesses”

---

## 🧑 Local Persona Pages
Each city auditor gets a profile with:
- Headshot
- Local-focused bio
- Contact form
- Schema markup for SEO
- Example: Brian Lapp (Ottawa), Cory Arsic (Guelph)

---

## 📢 Social & Outreach Layer
- Twitter/X and LinkedIn for each auditor
- Auto/manual post for each new audit (via Zapier or Buffer):
  > “We just reviewed The Junction Cafe in Guelph. Community members are asking for a better website. Cast your vote.”
- Tweet-to-tag buttons for local sharing

---

## ⚠️ Hard Rules (DO NOT)
- ❌ No mention of Entice
- ❌ No overt sales copy
- ❌ No linking to Entice or affiliate domains
- ❌ No generic AI content that feels templated or inhuman

---

## ✅ Launch Milestones
- [ ] 10 audit pages in Ottawa  
- [ ] 3 audit pages in Guelph  
- [ ] 3+ working SEO tools live  
- [ ] Begin social seeding and outreach  
- [ ] Contact opt-in + SMS collection in place  

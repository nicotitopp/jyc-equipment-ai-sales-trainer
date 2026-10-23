# JYC Equipment AI Sales Trainer — Design System & Redesign Specification

> **Design Theme:** Executive Industrial Intelligence (Modern SaaS + Premium Heavy Machinery)  
> **Source Platform:** Google Stitch Project `2241255190383546664`  
> **Skill Guidelines:** `frontend-design` (Anthropic Design Principles)

---

## 1. Design Vision & Philosophy

The objective is to transform the application from a rigid, developer-oriented terminal with excessive borders, dark tech boxes, and monospace text into a **high-trust, modern B2B SaaS platform** built specifically for heavy machinery sales development representatives (SDRs/AEs) and sales leadership.

### What We Eliminate:
* ❌ Hacker/terminal aesthetic and neon accents.
* ❌ Overuse of monospace typography for regular labels and values.
* ❌ Monotonous card grids with identical borders and shadows.
* ❌ Cluttered, cramped layouts that waste viewport space.
* ❌ Fake decorative graphs or statistics without real data.

### What We Establish:
* ✅ **Warm Precision:** Warm executive neutral surfaces (`#F8F9FA` to `#FFFFFF`) with subtle border containment (`#E2E8F0` / `#E5EEFF`).
* ✅ **Industrial Momentum:** Dedicated industrial machinery amber (`#E06D28` / `#D97706`) as an active accent for calls-to-action and critical coaching highlights, complemented by deep graphite (`#1E293B`) and steel blue (`#2563EB`).
* ✅ **Clean Typography Scale:** Primary font family is **Inter** / **Plus Jakarta Sans**, with intentional tracking (`-0.02em` on headlines) and crisp, highly legible body weights.
* ✅ **Realistic Calling Experience:** An active call screen designed like an executive audio workstation—clear customer context, fluid voice activity presence, legible dialogue bubbles, and non-distracting playbooks.

---

## 2. Color Palette & Tokens

| Token Name | Hex Code | Role & Usage |
| :--- | :--- | :--- |
| `surface-bg` | `#F8F9FA` | Main canvas background, warm and easy on the eyes |
| `surface-card` | `#FFFFFF` | Primary content surfaces, cards, and modal sheets |
| `surface-subtle`| `#F1F5F9` | Secondary containers, pill badges, and input fills |
| `text-primary` | `#0F172A` | Slate 900 / Deep graphite for high-contrast headlines |
| `text-secondary`| `#475569` | Slate 600 for supportive descriptions and metadata |
| `text-muted` | `#94A3B8` | Slate 400 for hints, timestamps, and inactive labels |
| `accent-primary`| `#E06D28` | Machinery Amber for main CTAs, voice triggers, and highlights |
| `accent-hover` | `#C25615` | Darker amber for active/hover states |
| `status-live` | `#10B981` | Emerald green for active call connected, pass rates, strengths |
| `status-busy` | `#F59E0B` | Amber for 'Busy' prospect demeanor and growth areas |
| `status-tough` | `#EF4444` | Crimson red for 'Tough' prospect demeanor and call disconnection |
| `border-subtle` | `#E2E8F0` | Slate 200 for crisp, minimal structure without heavy lines |

---

## 3. Typography Hierarchy

* **Primary Font Family:** `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
* **Display (`display-lg`):** `32px` - `36px` | Bold (`700`) | Letter spacing `-0.03em` | Line height `1.2`
* **Headline (`headline-md`):** `20px` - `24px` | SemiBold (`600`) | Letter spacing `-0.02em`
* **Subheading (`headline-sm`):** `16px` - `18px` | SemiBold (`600`) | Letter spacing `-0.01em`
* **Body Regular (`body-md`):** `14px` | Regular (`400`) | Line height `1.5`
* **Body Small (`body-sm`):** `12px` - `13px` | Regular (`400`) or Medium (`500`) | Line height `1.4`
* **Micro Labels (`label-sm`):** `11px` | SemiBold (`600`) | Letter spacing `+0.02em` (Sentence Case or Subtle Tracking)

---

## 4. The 3 Redesigned Core Screens

### Screen A: Practice Selection & Exploration (Dashboard)
* **Header & Identity:** Clean JYC brand bar with current trainee profile ("Sebastián Arango · Trainee") and direct tab navigation.
* **Hero Banner:** Professional invitation to practice cold calling with clear sector selector and quick launch button.
* **Scenario Grid:** 7 enterprise industrial sectors presented in spacious cards with:
  1. Sector icon and title (e.g. *Plastics & Injection Molding*, *Concrete & Quarries*, *Ports & Terminals*).
  2. Target Key Person role title (*Operations Director*, *Plant Manager*).
  3. Realistic machinery inventory (*500 to 2,000 Ton injection molders, extruders*).
  4. Core qualifying objective.
* **Practice Setup Drawer:** Intuitive selection of language (English/Spanish), prospect demeanor (Receptive / Busy / Tough), and background noise cancellation.

### Screen B: Active Voice Call Simulation
* **Customer Dossier Card:** Prominent caller identity banner with prospect name, company name, plant context, and call duration timer.
* **Sales Objective Box:** Highlighting the specific playbook goal (e.g., bypass gatekeeper, handle trade-in objection, secure email).
* **Voice Activity State:** Elegant visualizer indicating whether Sophie is speaking, listening, or thinking.
* **Dialogue Pane:** Humanized chat bubbles with distinct styling for trainee and prospect.
* **Central Calling Controls:** Mute, Noise Suppression toggle, and a clean "End Call & Audit" button.
* **Collapsible Playbook Drawer:** One-click drawer with objection cheat-sheets without cluttering the screen.

### Screen C: Post-Call Audit & Performance Scorecard
* **Performance Overview Card:** Clean score presentation with milestone checklist (Opening, Gatekeeper Bypass, Equipment Qualification, Objection Handling, Next Steps).
* **Executive Summary:** Polished narrative review of the cold call.
* **Strengths vs. Coaching Tips:** Two-column card layout cleanly categorizing what went well and actionable guidance.
* **Objections Handled Review:** Structured table/cards evaluating each customer friction point encountered.
* **Action CTAs:** "Practice Again", "Download PDF Report", and inline audio playback.

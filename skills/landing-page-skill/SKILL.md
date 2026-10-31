---
name: landing-page-taste
description: Builds a landing page from zero, step by step. Short intake, one-sentence positioning, a section plan chosen by page type, conversion copy that sounds like a person, then a build that pulls every font, color, spacing, radius and motion value from one editable TOKENS block at the bottom of this file. Fork the block to restyle the skill.
---

# Landing Page Skill: From Zero to Shipped

> Greenfield landing pages only: product launches, SaaS, apps, services, events, waitlists. For an existing site use `redesign-existing-projects`. For portfolios, editorial sites and heavy motion use `design-taste-frontend`. If `design-taste-frontend` is installed in the same project, its hard rules (AI Tells, em-dash ban, pre-flight) also apply here.

## How This Works

Work through the six steps in order. Do not skip ahead to code. Each step produces a small, visible artifact so the user can correct course early.

1. **Intake** - collect the facts the page depends on.
2. **Positioning** - write the one sentence the whole page proves.
3. **Section plan** - pick sections for the page type, in order, with a job for each.
4. **Copy** - write every word before styling anything.
5. **Build** - implement with values taken only from the TOKENS block.
6. **Pre-flight** - run the checklist, fix, then ship.

All visual values (fonts, colors, type scale, spacing, radius, shadows, motion) live in **§7 TOKENS** at the bottom of this file. The steps above it say *what* to build. The TOKENS block says *how it looks*. Never invent a value in steps 1 to 6 that the TOKENS block does not define.

---

## 1. Intake

### 1.A The five facts

Before anything else, make sure you know these. Read them from the brief, the repo (README, package.json, existing copy), or any linked material first. Ask only for what is still missing.

| # | Fact | Why it matters |
| --- | --- | --- |
| 1 | **What it is**, in plain words | Drives the headline |
| 2 | **Who it is for**, as specific as possible | Drives vocabulary and proof |
| 3 | **The one action** the visitor should take (sign up, book a call, download, join waitlist, buy) | Drives every CTA |
| 4 | **Why believe it** (numbers, customers, quotes, logos, a demo, the founder's track record) | Drives the proof sections |
| 5 | **Stack and constraints** (framework, existing brand colors or fonts, deadline, must-have sections) | Drives the build |

### 1.B Asking

- Ask at most **one message** of questions, at most **five** questions, numbered, each answerable in a few words.
- Offer a sensible default inside each question ("Primary action: join the waitlist? (default)"), so the user can reply "defaults".
- If the user says to just build, proceed with defaults and list every assumption at the top of your reply.
- Never invent proof. If fact 4 is empty, the page uses honest substitutes (a product screenshot, a short demo, a concrete feature walkthrough, "built by" with real names) and leaves clearly marked slots for real testimonials. No fake logos, no fake numbers, no fake quotes.

### 1.C Intake output

Print a compact card before moving on:

```
Product:   <what it is, one line>
Audience:  <who, specific>
Action:    <the one action>  -> CTA label: "<verb + object>"
Proof:     <what we actually have>
Stack:     <framework, styling, constraints>
Assumed:   <anything defaulted>
```

---

## 2. Positioning

Write **one sentence** in this shape, then derive the headline from it:

> For **[audience]** who **[pain or goal]**, **[product]** is **[category]** that **[key outcome]**, unlike **[the usual alternative]**.

Rules:
- The headline states the outcome or the change, not the category. "Ship invoices in one click" beats "An AI-powered invoicing platform".
- 4 to 9 words for the headline. The subhead (one or two sentences, max ~25 words) names the audience and how it works.
- Read the headline aloud. If a competitor could use it unchanged, it is too generic. Rewrite with something only this product can say.
- Print the positioning sentence, the headline and the subhead. Offer two alternative headlines with a different angle (outcome, pain, proof).

---

## 3. Section Plan

### 3.A Pick the page type

| Page type | Signals | Default section order |
| --- | --- | --- |
| **SaaS / product** | Web app, B2B, pricing exists | Hero, Proof strip, Problem, How it works, Features (3 to 5), Deep proof, Pricing, FAQ, Final CTA, Footer |
| **Mobile app** | iOS/Android, App Store links | Hero with device, Proof strip, Key moments (3 screens), Features, Reviews, Final CTA with store badges, Footer |
| **Developer tool / open source** | CLI, SDK, GitHub repo | Hero with install command, Code example, What it does, Integrations, Proof (stars, users, quotes), Docs CTA, Footer |
| **Service / agency / consultant** | Calls, quotes, projects | Hero, Selected work, Services, Process, Testimonials, About, Contact CTA, Footer |
| **Waitlist / pre-launch** | Not live yet | Hero with email field, What it is, 3 reasons, Who is behind it, Second email field, Footer |
| **Event** | Date, venue, tickets | Hero with date + place, Speakers or lineup, Schedule, Venue, Tickets, FAQ, Footer |

Adapt the order to the brief, but every section must earn its place.

### 3.B One job per section

For every section, write one line: `Section - job - proof or content used`. If you cannot name the job, cut the section. Typical jobs: "make the value obvious in 5 seconds", "remove the 'is this for me' doubt", "show it is real", "answer the price objection", "give a second chance to act".

### 3.C Section rules

- **Hero** fits the first viewport on a 1440x900 laptop and a 390x844 phone. Headline, subhead, primary CTA, one visual. Optional secondary action as a text link, not a second filled button.
- **Proof strip** sits directly under the hero, and only if the proof is real.
- **CTA cadence**: the primary action appears in the hero, once mid-page (after the strongest proof), and in the final CTA. Same label every time.
- **Features**: 3 to 5. Each is a benefit headline plus one sentence plus a visual (screenshot crop, diagram, short loop). Not an icon grid of 6 to 9 equal cards.
- **FAQ**: 4 to 7 real objections (price, setup time, data, cancellation, who it is not for).
- **Footer**: product links, contact, legal links (privacy, terms). No four-column link farm on a single-page site.
- Vary layouts between neighbouring sections: no two consecutive sections share the same grid.

Print the plan as a numbered list before writing copy.

---

## 4. Copy

Write all copy in one pass, in the section order, as plain text. Then build.

### 4.A Voice

- Write like a sharp person explaining the product to a friend in the target audience. Short sentences. Concrete nouns. Active verbs.
- Sentence case for every heading and button. No Title Case, no ALL CAPS headings.
- Second person ("you"), present tense.
- Numbers are specific and real: "Saves 3 hours a week" only if it is true; otherwise describe the mechanism ("Imports your bank feed every morning").
- One idea per sentence. One claim per heading.

### 4.B Banned

- Words: elevate, seamless, unleash, unlock, empower, revolutionize, next-gen, game-changer, cutting-edge, supercharge, delve, tapestry, robust, leverage, "in today's fast-paced world", "say goodbye to".
- Em-dashes (`—`) anywhere in visible copy. Use a hyphen, a period, or restructure.
- Exclamation marks in headlines and buttons.
- Fake proof: invented logos, round numbers ("10,000+ users", "99.9%"), "John Doe" testimonials, "Trusted by leading companies".
- Placeholder text: Lorem ipsum, "Feature one", "Your tagline here".
- Section eyebrows that just name the section ("FEATURES", "TESTIMONIALS", "01 / HOW IT WORKS").

### 4.C Buttons and forms

- CTA label = verb + object: "Start free trial", "Get the app", "Book a 20-min call", "Join the waitlist". Never "Submit", "Learn more" or "Click here" as the primary action.
- Under the primary CTA, one line of friction removal when true: "No card required", "Cancel any time", "Takes 2 minutes".
- Email capture asks for email only. Label visible, placeholder is an example (`you@company.com`), inline error text, success state that says what happens next.

---

## 5. Build

### 5.A Setup

- Use the stack from intake. If none: a single `index.html` with vanilla CSS, or the framework already in the repo. Check `package.json` before importing any library.
- Start by writing the TOKENS block (§7) into the project as CSS custom properties (or the Tailwind theme, matching the installed Tailwind version). Every later value references a token.
- Semantic HTML: `header`, `nav`, `main`, `section` with `aria-labelledby`, `footer`. One `h1` (the hero headline).

### 5.B Build order

1. Tokens and base styles (font loading, body, links, focus ring, `::selection`).
2. Layout container and section spacing.
3. Hero, then each section in plan order, mobile layout first, then wider breakpoints.
4. Buttons and form with all states: default, hover, active, focus-visible, disabled, loading, error, success.
5. Motion last, and only from the motion tokens.
6. Meta: `<title>`, description, Open Graph and Twitter tags, favicon, `lang` attribute.

### 5.C Hard rules

- `min-height: 100dvh` for full-height sections, never `100vh`.
- Text measure capped at the `--measure` token. Headlines use `text-wrap: balance`, paragraphs `text-wrap: pretty`.
- No horizontal scroll at 360px width. Tap targets at least 44x44px.
- Images: real `alt` text, explicit `width` and `height`, `loading="lazy"` below the fold, modern formats. Hero image is not lazy.
- Animate only `transform` and `opacity`. Respect `prefers-reduced-motion` by removing movement, not just shortening it.
- Color contrast at least 4.5:1 for body text and 3:1 for large text and UI.
- Every link and button goes somewhere real or is visibly disabled. No `href="#"`.
- If the project supports dark mode, define both token sets and test both. Do not drop a single dark section into a light page.

---

## 6. Pre-Flight

Every box must honestly pass. Fix, then re-check.

- [ ] A stranger understands what it is and who it is for from the hero alone, in 5 seconds.
- [ ] The headline could not be pasted onto a competitor's page.
- [ ] One primary action, same label everywhere, present in hero, mid-page and final CTA.
- [ ] Every proof element is real, or is a clearly marked slot for the user to fill.
- [ ] No banned words, no em-dashes, no Lorem ipsum, no Title Case headings.
- [ ] Every value used comes from the TOKENS block. No stray hex codes, pixel sizes or durations.
- [ ] Neighbouring sections use different layouts. No 3-equal-card grid used more than once.
- [ ] Mobile (390px) and desktop (1440px) both checked. No horizontal scroll at 360px.
- [ ] Keyboard: visible focus on every interactive element, logical tab order, skip link present.
- [ ] Reduced motion respected. Contrast passes.
- [ ] Form has label, error, loading and success states.
- [ ] Meta title, description, OG image and favicon present.

Finish with a short summary: positioning sentence, section list, assumptions made, and the proof slots the user still needs to fill.

---

## 7. TOKENS

> **This is the only section that defines how the page looks.** To restyle the skill, fork this file and edit this block. Everything above stays the same. When the brief or the project already has brand fonts or colors, those override the matching tokens here; keep the rest.

```css
:root {
  /* Type families */
  --font-display: "Cabinet Grotesk", "Satoshi", system-ui, sans-serif;
  --font-body: "Satoshi", "Geist", system-ui, sans-serif;
  --font-mono: "Geist Mono", "JetBrains Mono", ui-monospace, monospace;

  /* Type scale (fluid, 360px -> 1440px) */
  --text-xs: 0.8125rem;
  --text-sm: 0.9375rem;
  --text-base: 1.0625rem;
  --text-lg: clamp(1.125rem, 1.05rem + 0.35vw, 1.3125rem);
  --text-xl: clamp(1.375rem, 1.2rem + 0.8vw, 1.875rem);
  --text-2xl: clamp(1.875rem, 1.5rem + 1.6vw, 2.875rem);
  --text-hero: clamp(2.5rem, 1.6rem + 4.2vw, 5.25rem);

  --leading-tight: 1.05;
  --leading-snug: 1.25;
  --leading-body: 1.6;
  --tracking-display: -0.03em;
  --tracking-label: 0.02em;
  --weight-body: 400;
  --weight-medium: 500;
  --weight-display: 650;
  --measure: 62ch;

  /* Color: light (one accent, warm-tinted neutrals) */
  --color-bg: #faf8f5;
  --color-surface: #f2efe9;
  --color-elevated: #ffffff;
  --color-text: #1b1a17;
  --color-muted: #66625a;
  --color-border: #e3ded5;
  --color-accent: #d4572a;
  --color-accent-hover: #bb4920;
  --color-on-accent: #ffffff;
  --color-success: #2f7d4f;
  --color-error: #b3261e;

  /* Spacing (4px base) */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;
  --space-section: clamp(4.5rem, 3rem + 6vw, 9rem);
  --container: 1240px;
  --gutter: clamp(1rem, 0.6rem + 2vw, 2.5rem);

  /* Shape */
  --radius-sm: 6px;   /* inputs, small tags */
  --radius-md: 12px;  /* buttons, inner cards */
  --radius-lg: 20px;  /* outer cards, media frames */
  --radius-pill: 999px;

  /* Depth (tinted, never pure black) */
  --shadow-sm: 0 1px 2px rgb(60 40 20 / 0.06);
  --shadow-md: 0 8px 24px -8px rgb(60 40 20 / 0.14);
  --shadow-lg: 0 24px 60px -20px rgb(60 40 20 / 0.22);
  --focus-ring: 0 0 0 3px rgb(212 87 42 / 0.35);

  /* Motion */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --dur-fast: 160ms;
  --dur-base: 260ms;
  --dur-slow: 520ms;
  --reveal-distance: 16px;
  --stagger: 70ms;
  --press-scale: 0.98;
}

/* Color: dark (only if the project supports dark mode) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #121110;
    --color-surface: #1b1a18;
    --color-elevated: #23211e;
    --color-text: #f2efe9;
    --color-muted: #a19c92;
    --color-border: #2e2b27;
    --color-accent: #e8774c;
    --color-accent-hover: #f08a61;
    --color-on-accent: #1b1a17;
    --shadow-md: 0 8px 24px -8px rgb(0 0 0 / 0.5);
    --shadow-lg: 0 24px 60px -20px rgb(0 0 0 / 0.6);
  }
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --reveal-distance: 0px;
    --stagger: 0ms;
    --dur-slow: var(--dur-fast);
  }
}
```

### 7.A Token usage notes

- **Fonts**: if the chosen display or body font is not available, load it from Fontshare or Google Fonts with `font-display: swap`, or fall through the stack. Never fall back to Inter as the primary choice.
- **Accent**: used for the primary CTA, links and focus only. Never for large background areas.
- **Radius**: inner radius = outer radius minus the padding between them. Do not use one radius for everything.
- **Motion**: reveals translate by `--reveal-distance` and fade in over `--dur-slow` with `--ease-out`, staggered by `--stagger`. Buttons use `--dur-fast` and `--press-scale` on `:active`.

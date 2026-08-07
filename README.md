# Dynamic Portfolio Maker

A multi-tenant portfolio builder. Anyone signs in with Google, customizes a
rich, animated portfolio from a dashboard, and publishes it to a unique
public link (`yoursite.com/username`) that visitors can view instantly.

Built with Next.js (App Router), Firebase (Auth + Firestore), Cloudinary
(image/resume uploads), and Framer Motion for the premium animations.

## Features

- Google sign-in (Firebase Auth), one portfolio per account
- Dashboard editors for Hero, About, Education, Experience, Skills,
  Projects, Certifications, Awards, Achievements, Open Source, Blogs,
  Testimonials, Contact & Social, and Theme
- Cloudinary uploads for profile photo, banner, project/certification
  images, and resume PDF
- Five curated color themes with light/dark mode
- Publish/unpublish toggle with a copyable public link
- Resume import: upload a PDF and have education, experience, skills and
  contact details parsed out and reviewed side by side before they land
- Optional AI assistant: a chat panel for writing help plus a "Rewrite
  with AI" control on every long-form field (see below)
- Animated public portfolio page: typing effect, particle/gradient
  background, scroll reveals, tilt cards, magnetic buttons, count-up
  stats, timeline animations, glassmorphism, an infinite 3D project
  gallery with Lenis smooth scrolling, and more
- Deploys as a static site, so it runs on Firebase's free Spark plan

## AI features (optional, bring your own key)

The assistant and the rewrite buttons are off until you add an API key in
the dashboard (open **Ask AI** in the bottom-right corner). Two providers
are supported:

| Provider | Cost | Get a key |
| --- | --- | --- |
| Google Gemini | Free tier, no card required | <https://aistudio.google.com/apikey> |
| Anthropic Claude | Paid, billed to your account | <https://console.anthropic.com/settings/keys> |

The key is stored in **localStorage on that browser only** and is sent
straight to the provider from the browser. It is deliberately never
written to Firestore: `portfolios/{username}` is world-readable — that is
what makes the public page load without auth — so a key saved there would
be published along with the portfolio. It also means the key isn't synced
between devices, and anyone with access to the machine can read it, so use
a key you're willing to rotate.

There is no shared key and no server-side proxy, because the app is a
static export with no backend of its own.

## Getting started locally

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

### 1. Firebase project

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication** → Sign-in method → enable **Google**.
3. **Firestore Database** → create a database (production mode).
4. **Project settings → General → Your apps** → add a Web app → copy the
   config values into `NEXT_PUBLIC_FIREBASE_*` in `.env.local`.
5. Deploy Firestore rules with the Firebase CLI when you have it installed
   locally: `firebase deploy --only firestore:rules`. (A service account key
   is only needed for deploying — the app itself talks to Firestore purely
   through the client SDK.)

### 2. Cloudinary

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. From the Dashboard, copy **Cloud name** into
   `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.
3. Go to **Settings → Upload → Upload presets → Add upload preset**, set
   **Signing Mode** to *Unsigned*, save, and copy its name into
   `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`. Because the site is fully static
   there is no server to sign uploads, so restrict the preset there
   (allowed formats, max file size) to keep it from being abused.
4. Go to **Settings → Security** and make sure **PDF and ZIP files** is *not*
   listed under **Restricted media types**. Cloudinary blocks PDF delivery by
   default on new accounts, which uploads the resume successfully but then
   fails to serve it — the Download Resume button returns an error instead of
   the file.

### 3. Run it

```bash
npm run dev
```

Visit `http://localhost:3000`, sign in with Google, claim a username, and
start building.

## Deployment (GitHub Actions only)

This project deploys **exclusively through GitHub Actions** — there is no
manual/local `firebase deploy` step in the intended workflow.

1. In your Firebase project, go to **Project settings → Service accounts**
   → Generate new private key. This downloads a JSON file — you'll add its
   contents as a single secret below.
2. In `.firebaserc`, replace `REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID` with
   your actual Firebase project ID.
3. In your GitHub repo → **Settings → Secrets and variables → Actions**,
   add these 9 repository secrets:

   | Secret | Where it comes from |
   | --- | --- |
   | `FIREBASE_SERVICE_ACCOUNT` | The **entire JSON file** from step 1 (authenticates the deploy) |
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | Project settings → General → Your apps → Web app config |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | same web app config |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | same web app config |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | same web app config |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | same web app config |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | same web app config |
   | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary Console → Dashboard |
   | `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Name of the *unsigned* upload preset you created |

   The Hosting project/site the deploy targets comes from `.firebaserc` and
   `firebase.json`, so no separate project-ID secret is needed.
4. Push to `main` — `.github/workflows/firebase-hosting-merge.yml` builds
   the app and runs `firebase deploy --only hosting,firestore:rules,firestore:indexes`,
   so your security rules ship together with the site.
5. Every pull request automatically gets a temporary **preview channel**
   deploy via `.github/workflows/firebase-hosting-pull-request.yml`. Preview
   deploys intentionally skip Firestore rules/indexes, since those are
   project-wide and shouldn't be changed by an unmerged PR.
6. `.github/workflows/ci.yml` runs lint + build on every push/PR as a
   sanity check.

> **Runs on the free plan.** The app is built as a static export
> (`output: "export"`), so Firebase Hosting serves it without Cloud
> Functions — no **Blaze** upgrade required.
>
> The trade-off: portfolio pages are rendered in the browser, so search
> engines and social-media link previews see the page shell rather than the
> portfolio owner's name and photo. Restoring that would require a host that
> runs server-side rendering (Blaze, or a free SSR host such as Vercel).

## Project structure

```
app/
  (marketing)/          Landing page
  (auth)/login/         Sign-in page
  onboarding/           Username claim flow (first login)
  dashboard/            Auth-guarded editor (one route per section)
  portfolio/            Public portfolio page; Hosting rewrites /{username} here
components/
  hero/, sections/      Public portfolio building blocks
  effects/              Reusable animation primitives
  dashboard/            Editor shell + generic CRUD list editor
  portfolio/            Theme/nav wrappers for the public page
lib/
  firebase/             Client SDK init
  firestore/             Firestore data access
  cloudinary/            Unsigned browser-upload helper
  themes.ts             Color preset definitions
types/portfolio.ts       Shared data model
firestore.rules          Firestore security rules
```

## Data model

Each portfolio is a single Firestore document at `portfolios/{username}`
(see `types/portfolio.ts`), keeping the public page to one read — the doc ID
*is* the username, so no lookup index is needed. A
`users/{uid}` document maps an authenticated owner to their claimed
username. Firestore rules restrict writes to the document's `ownerUid`
while keeping `portfolios/*` publicly readable.

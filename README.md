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
- Cloudinary uploads (signed, server-side) for profile photo, banner,
  project/certification images, and resume PDF
- Five curated color themes with light/dark mode
- Publish/unpublish toggle with a copyable public link
- Animated public portfolio page: typing effect, particle/gradient
  background, scroll reveals, tilt cards, magnetic buttons, count-up
  stats, timeline animations, glassmorphism, and more
- SEO metadata (title/description/OG tags) per portfolio

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
5. **Project settings → Service accounts** → Generate new private key →
   copy `project_id`, `client_email`, `private_key` into `FIREBASE_*`
   (server-only) in `.env.local`. Keep the `\n` escapes literal.
6. Deploy Firestore rules with the Firebase CLI when you have it installed
   locally: `firebase deploy --only firestore:rules`.

### 2. Cloudinary

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. From the Dashboard, copy **Cloud name**, **API Key**, and **API Secret**
   into `CLOUDINARY_*` in `.env.local`. No upload preset is needed —
   uploads are signed server-side (see `app/api/cloudinary/sign/route.ts`).

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
   add these repository secrets:
   - `FIREBASE_SERVICE_ACCOUNT` — the full JSON contents of the service
     account key from step 1
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Push to `main` — `.github/workflows/firebase-hosting-merge.yml` builds
   the app and deploys it to the Firebase Hosting **live** channel.
5. Every pull request automatically gets a temporary **preview** deploy via
   `.github/workflows/firebase-hosting-pull-request.yml`.
6. `.github/workflows/ci.yml` runs lint + build on every push/PR as a
   sanity check.

## Project structure

```
app/
  (marketing)/          Landing page
  (auth)/login/         Sign-in page
  onboarding/           Username claim flow (first login)
  dashboard/            Auth-guarded editor (one route per section)
  [username]/           Public, SSR'd portfolio page
  api/cloudinary/sign/  Signed upload endpoint (server-only secret)
components/
  hero/, sections/      Public portfolio building blocks
  effects/              Reusable animation primitives
  dashboard/            Editor shell + generic CRUD list editor
  portfolio/            Theme/nav wrappers for the public page
lib/
  firebase/             Client + Admin SDK init
  firestore/             Data access (client + server)
  cloudinary/            Signed upload helpers
  themes.ts             Color preset definitions
types/portfolio.ts       Shared data model
firestore.rules          Firestore security rules
```

## Data model

Each portfolio is a single Firestore document at `portfolios/{username}`
(see `types/portfolio.ts`), keeping the public page to one read. A
`users/{uid}` document maps an authenticated owner to their claimed
username. Firestore rules restrict writes to the document's `ownerUid`
while keeping `portfolios/*` publicly readable.

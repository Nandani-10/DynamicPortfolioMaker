# Dynamic Portfolio Maker

A multi-tenant portfolio builder. Anyone signs in with Google, customizes a
rich, animated portfolio from a dashboard, and publishes it to a unique
public link (`yoursite.com/username`) that visitors can view instantly.

Built with Next.js (App Router), Firebase (Auth + Firestore), Cloudinary
(image/resume uploads), and Framer Motion for the premium animations.

## Features

- Google sign-in (Firebase Auth), one portfolio per account
- "Us": a separate, invite-nobody private space at `/us` for two people —
  see [its own section](#us--the-private-space-at-us)
- Dashboard editors for Hero, About, Education, Experience, Skills,
  Projects, Certifications, Awards, Achievements, Open Source, Blogs,
  Testimonials, Contact & Social, and Theme
- Cloudinary uploads for profile photo, banner, project/certification
  images, and resume PDF
- Five curated color themes with light/dark mode
- Publish/unpublish toggle with a copyable public link
- Resume import: upload a PDF and have education, experience, skills and
  contact details parsed out and reviewed side by side before they land
- AI assistant: a chat panel for writing help, a "Rewrite with AI" control
  on every long-form field, and a "Use this" button that inserts a reply
  straight into a field (see below)
- Publish state, public link, and publish/unpublish reachable from the top
  of every dashboard page
- Animated public portfolio page: typing effect, particle/gradient
  background, scroll reveals, tilt cards, magnetic buttons, count-up
  stats, timeline animations, glassmorphism, an infinite 3D project
  gallery with Lenis smooth scrolling, and more
- Deploys as a static site, so it runs on Firebase's free Spark plan

## AI features

A chat assistant (**Ask AI**, bottom-right of the dashboard) and a
**Rewrite with AI** control under every long-form field. Each assistant
reply carries a **Use this** button that drops the text straight into a
field on the page you're on.

### Supplying a key

Either the site supplies one for everyone, or each owner brings their own.

**Shared key (`NEXT_PUBLIC_GEMINI_API_KEY`)** — set it and AI works for
every visitor with nothing to configure. Understand the trade first:
`NEXT_PUBLIC_*` values are inlined into the JavaScript bundle, and this is
a static export with no server to hide a secret behind. **Anyone who opens
devtools on the deployed site can read that key and spend its quota.**

If you set it, restrict it in Google Cloud Console → Credentials → the key
→ Application restrictions → Websites, listing only your own domains. That
blocks casual reuse from other origins. It is not airtight — a referrer
header can be forged — so never point it at a key on a billed account. The
only way to hold a key that genuinely can't be read is to put a small
server-side proxy in front of it, which this deployment doesn't have.

**Own key** — leave the variable empty and each owner adds a key in the
dashboard. An owner's own key always takes precedence over the shared one,
so they can move their usage off it at any time. Two providers:

| Provider | Cost | Get a key |
| --- | --- | --- |
| Google Gemini | Free tier, no card required | <https://aistudio.google.com/apikey> |
| Anthropic Claude | Paid, billed to your account | <https://console.anthropic.com/settings/keys> |

An owner's own key is stored in **localStorage on that browser only** and
is sent straight to the provider from the browser. It is deliberately never
written to Firestore: `portfolios/{username}` is world-readable — that is
what makes the public page load without auth — so a key saved there would
be published along with the portfolio. It also means the key isn't synced
between devices, and anyone with access to the machine can read it, so use
a key you're willing to rotate.

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
   add these repository secrets:

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
   | `NEXT_PUBLIC_GEMINI_API_KEY` | *Optional.* A shared Gemini key so AI works for everyone — read the warning under [AI features](#ai-features) first, since it ends up readable in the deployed bundle. Omit it and each owner supplies their own. |

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
  us/                   "Us" — the private two-person space (see below)
components/
  hero/, sections/      Public portfolio building blocks
  effects/              Reusable animation primitives
  dashboard/            Editor shell + generic CRUD list editor
  portfolio/            Theme/nav wrappers for the public page
  us/                   Everything the private space is made of
lib/
  firebase/             Client SDK init
  firestore/             Firestore data access
  cloudinary/            Unsigned browser-upload helper
  themes.ts             Color preset definitions
  us/                   Space config, Firestore access, prompt banks, drawing
types/portfolio.ts       Shared data model
types/us.ts              Data model for the private space
firestore.rules          Firestore security rules
```

## Data model

Each portfolio is a single Firestore document at `portfolios/{username}`
(see `types/portfolio.ts`), keeping the public page to one read — the doc ID
*is* the username, so no lookup index is needed. A
`users/{uid}` document maps an authenticated owner to their claimed
username. Firestore rules restrict writes to the document's `ownerUid`
while keeping `portfolios/*` publicly readable.

## "Us" — the private space at `/us`

A second, self-contained app living in the same deployment: a small private
world for exactly two people. It is built around the idea that neither person
should have to invent something to say — a morning and a night that play as
short films, doodles that replay stroke by stroke, moods, thoughts left to be
found later, blind-answer games, a memory wall, countdowns, and an "I want to
talk, but I don't know how" mode that writes the message for you.

The tone is deliberately restrained: plain sentences, no declarations, no pet
names. ⭐ is the only bit of shorthand — it stands in for whatever would
otherwise need saying, and it is the reaction, the sticker and the sign-off.

The palette follows the clock (dawn → day → evening → night) instead of a
light/dark toggle, and every animation stands down under
`prefers-reduced-motion`.

### Locking it to two people

The guest list lives in **`firestore.rules`** and nowhere else. It holds the
SHA-256 of each address rather than the address itself, because this
repository is public and a rules file would otherwise publish both owners'
email addresses in plain text:

```
printf '%s' 'their@address.com' | openssl dgst -sha256 -binary | base64
```

Put the two digests in `coupleEmailHashes()`. The app is never told who is on
the list — it tries to read the space and reports the refusal — so nothing
identifying reaches the deployed JavaScript, and there is no client-side check
to bypass.

This is not a strong secret: someone who already suspects an address can
confirm it by hashing it. It keeps the addresses out of search results,
scrapers and the bundle, which is what a hash can honestly do here.

**`NEXT_PUBLIC_US_PIN`** *(optional)* — a shared PIN, asked once every 12
hours per device. A curtain for an already-unlocked phone, not a vault:
`NEXT_PUBLIC_*` values are readable in the bundle.

Photos, voice notes and memory images go through the same unsigned Cloudinary
upload as the rest of the app; without those two env vars the space still
works, minus media.

`NEXT_PUBLIC_US_SPACE_ID` and `NEXT_PUBLIC_US_PIN` are optional repository
secrets (**Settings → Secrets and variables → Actions**); no secret is needed
to open the space, since access is settled by the rules.

Note that pull-request previews deliberately don't deploy Firestore rules, so
`/us` on a preview channel can sign you in but not read or write anything —
the rules that grant the two of you access only ship when main deploys.

### Data model

Everything lives under one document tree so a single rules block can gate it:

```
spaces/{spaceId}
  members/{uid}       name, avatar, colour, status, mood, presence, typing
  messages/{id}       text · morning · night · drawing · photo · voice ·
                      thought · mood · question · surprise, plus reactions
  thoughts/{id}       notes left to be discovered later
  memories/{id}       the memory-wall timeline
  rounds/{id}         This or That / Would You Rather / Two Truths (blind)
  days/{YYYY-MM-DD}   morning + night greetings, and the daily check-in
```

Drawings are stored as normalized stroke points rather than images, which is
what makes the replay animation possible (and keeps them tiny).

### Developing against the emulators

Set `NEXT_PUBLIC_FIREBASE_EMULATORS=1` in `.env.local` and run
`firebase emulators:start --only auth,firestore` — the client then talks to
auth on `:9099` and Firestore on `:8080`, so work in progress never touches
real data. The emulator loads `firestore.rules`, so access rules are exercised
too.

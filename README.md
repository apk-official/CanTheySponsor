<!--
  REPLACE THIS BLOCK with your actual demo video.
  Option A – GitHub-hosted MP4 (drag & drop in a PR or issue, copy the URL):
    https://user-images.githubusercontent.com/YOUR_ID/cantheysponsor-demo.mp4

  Option B – Animated GIF (recorded via Kap / LICEcap / ScreenToGif):
    ![Demo](./docs/demo.gif)

  Option C – YouTube / Loom embed (GitHub doesn't autoplay, so link a thumbnail):
    [![Watch the demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)
-->

https://user-images.githubusercontent.com/YOUR_GITHUB_ID/cantheysponsor-demo.mp4

> **Replace the line above** with your own hosted video URL or GIF. See the comment block for options.

---

<div align="center">

# 🇬🇧 CanTheySponsor

### Instantly search the UK Home Office Register of Licensed Sponsors

**[cantheysponsor.co.uk](https://cantheysponsor.co.uk)** <br>· Free · No sign-up · Always up to date

</div>

---

## What is CanTheySponsor?

The UK Home Office publishes a [Register of Licensed Sponsors](https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers), a list of every UK employer authorised to sponsor overseas workers on a Skilled Worker or other visa route. The official download is a raw CSV file with **140,000+ rows** and no search interface.

**CanTheySponsor** turns that dataset into a fast, clean, public-facing search tool so that:

- **Job seekers** can quickly check whether a prospective employer can sponsor a visa before applying.
- **Recruiters & HR teams** can verify a company's sponsorship status at a glance.


No login. No ads. No cost. Just the data, made searchable.

---

## Features

| Feature | Details |
|---|---|
| **Full-text company search** | Instant filtering across 140k+ rows as you type, debounced for performance |
| **Location / radius filter** | Enter a UK postcode or city name and filter sponsors within a chosen radius |
| **Route & rating filters** | Filter by visa route (Skilled Worker, Student, etc.) and licence rating |
| **Virtualised results table** | Only renders visible rows — stays smooth even with the full dataset loaded |
| **Fully responsive** | Works on mobile, tablet, and desktop |
| **Accessible** | Semantic HTML, keyboard-navigable, screen-reader friendly |
| **Always current** | Source CSV is fetched directly from the Home Office at build/load time |
| **Export** | Download filtered results as CSV or PDF, or grab the full register |

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | React 19 + TypeScript | Concurrent features, strong typing |
| **Build tool** | Vite | Fast development server and production builds |
| **Styling** | Tailwind CSS v4 | Utility-first, minimal runtime overhead |
| **UI components** | shadcn/ui + Radix UI | Accessible primitives, unstyled by default |
| **CSV parsing** | PapaParse | Fast streaming parse of large CSV files in-browser |
| **List virtualisation** | TanStack Virtual | Renders only visible rows from 140k+ records |
| **Async state** | TanStack Query | `useMutation` for geocoding; handles loading and error states |
| **Geocoding** | postcodes.io | Free, no-key UK postcode → lat/lng |
| **Nearby places** | Overpass API | Queries OpenStreetMap data to find towns within a radius |
| **Input debounce** | use-debounce | 300ms debounce on company search to prevent re-filtering on every keystroke |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm or pnpm

### Install & run

```bash
git clone https://github.com/YOUR_USERNAME/cantheysponsor.git
cd cantheysponsor
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
npm run build
npm run preview   # serve the dist/ folder locally
```

---

## Data Source & Licence

The sponsor register is published by the **UK Home Office** under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).

> Contains public sector information licensed under the Open Government Licence v3.0.

The data is used unmodified aside from in-memory filtering. CanTheySponsor is an independent tool and is not affiliated with, endorsed by, or connected to the Home Office or any UK government department.

---

## Licence

See [LICENSE](./LICENSE).
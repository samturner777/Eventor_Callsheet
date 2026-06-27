# Callsheet

A two-sided event production marketplace prototype — book media/AV, stage, photographers,
vans, event grounds, ushers, sound, and lighting vendors, or manage your own vendor listings.

This is a **frontend-only prototype** with sample data baked in (`src/App.jsx`). There is no
backend, database, or auth — everything resets on page refresh. It's built to validate the
product experience before wiring up real infrastructure.

## What's in the prototype

- **Customer side** — browse vendors by department, search, view pre-grouped package bundles
  with bundle discounts, pick a date + call time per vendor (respecting each vendor's lead
  time), and build a "Run of Show" — a call-sheet-styled cart where each booking gets
  individually confirmed.
- **Vendor side** — a dashboard view with a sample bookings table and listings management
  (toggle between BOOK / VENDOR in the top nav).
- **Currency** — Ghanaian Cedis (GH₵) throughout.

## Running it locally

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

To build a static production bundle:

```bash
npm run build
npm run preview   # serve the build locally to check it
```

## Project structure

```
callsheet/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx       # React entry point
    ├── index.css      # Tailwind directives
    └── App.jsx        # Everything: data, components, views
```

Everything — sample data, all components, both views — currently lives in `src/App.jsx` for
simplicity, since this was built and iterated on as a single artifact. As the project grows,
natural next splits are:

- `src/data/` — move `VENDORS`, `CATEGORIES`, `BUNDLES` out into their own files (eventually
  replaced by API calls)
- `src/components/` — split out `VendorCard`, `BundleCard`, `SchedulePickerModal`,
  `RunOfShowDrawer`, `TopBar`, etc.
- `src/views/` — `CustomerView.jsx`, `VendorDashboard.jsx`

## What's NOT here yet (known gaps)

- No backend/API — all data is hardcoded in `App.jsx`
- No persistence — cart and confirmations reset on refresh
- No real authentication for customers or vendors
- No payment integration
- No vendor-side availability blocking (a vendor's already-booked dates aren't excluded from
  the date picker yet)
- "Request Bookings" button doesn't actually submit anywhere

## Design language

The visual identity is built around the language of an actual production call sheet rather
than a generic marketplace look — department tags (`AV-01`, `STG-02`, etc.), spec-sheet-style
vendor metadata, lead-time stamps, and the "Run of Show" cart metaphor instead of a standard
shopping cart.

# Cardfile

A free local business directory (local citations): ranked "best of" pages per city, category and neighbourhood, plus a card per
business with its name, address, phone, opening hours and map.

It shares Benchmark's, web6's and web 8's database and data layer (`lib/data.ts`, `lib/db.ts`, `lib/actions.ts`, `lib/validate.ts`);
only the design differs. The look is a card file: white index cards on a graphite "desk" with a cutting-mat grid, one raspberry
accent, and Red Hat Display / Text / Mono. Ratings are ring gauges (`Rating` in `components/ui.tsx`), ranks and categories sit on
index-card tabs, the header nav is a row of file tabs, home has a stacked card deck, category "drawer" tabs and a city cabinet, and
/cities has a phone-book thumb index. All styles live in `app/globals.css`, tokens at the top.

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # unit checks for placeholder tints, rating rings, plurals and safe links
npm run build
```

- **Database:** listings are read from the shared Postgres (Supabase). Put the read-only login in `.env.local`:
  ```
  WEB_DATABASE_URL=postgresql://web_reader.<project>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
  ```
  Use port **5432** (Supabase's session pooler).
- **Domain:** set `SITE_URL` in `.env.local` to the live address. It drives canonical URLs, the sitemap and the domain stamped on
  listing requests, so the Control Center publishes them on this site. The name and placeholder domain are in `lib/site.ts`.
- **Adding businesses:** the form inserts into `listing_requests` through `WEB_FORMS_DATABASE_URL` (insert-only).
- **Publishing rules:** a city + category page needs 5+ businesses, an area page 3+ (`lib/site.ts`).

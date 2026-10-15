import Link from 'next/link'
import { Suspense, type ReactNode } from 'react'
import { ActiveNavTabs, NavTabs } from '@/components/client'
import { getCategoryCities, getCities, getCityCategories, getPopularNiches } from '@/lib/data'
import { SITE } from '@/lib/site'
import type { AreaCount, Business } from '@/lib/types'
import { cap, cityName, hash, hostname, num, pct, photoSize, plural, safeUrl, telHref } from '@/lib/utils'

// ---------- marks & icons ----------

// An index card with a raspberry tab: the logo, and app/icon.svg.
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M7 4h8a2 2 0 0 1 2 2v3H5V6a2 2 0 0 1 2-2Z" fill="#c81e57" />
      <rect x="3" y="8" width="26" height="20" rx="3.5" fill="#1c1b1f" />
      <rect x="8" y="14" width="12" height="2.4" rx="1.2" fill="#fff" />
      <rect x="8" y="19.5" width="16" height="2.4" rx="1.2" fill="#fff" opacity=".55" />
    </svg>
  )
}

const ICONS = {
  pin: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Zm0-8.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-9 9h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3.5 2',
  search: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM20 20l-4.8-4.8',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  route: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12-10a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM8 17h7.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H16',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  cross: 'M7 7l10 10M17 7 7 17',
  card: 'M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Zm4 4h4M7 14h7m3-4h.01',
  // category groups
  health: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm7 5v8m-4-4h8',
  home: 'M3 11 12 4l9 7M5 9.5V20h14V9.5M10 20v-6h4v6',
  food: 'M7 3v7a2 2 0 0 0 2 2v9m2-18v7a2 2 0 0 1-2 2M17 21V3c-2 1.5-3 4.5-3 8h3',
  shop: 'M5 8h14l-1 13H6L5 8Zm4 0V6a3 3 0 0 1 6 0v2',
  work: 'M4 7h16v13H4V7Zm5 0V4h6v3M4 13h16',
  beauty: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2.5-13.5L20 19M8.5 16.5 20 5',
  car: 'M5 17H3v-5l2-5h14l2 5v5h-2M3 12h18M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm-6 0h6',
  bed: 'M3 19V5m0 9h18v5m0-5v-3a3 3 0 0 0-3-3h-8v6M6.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  edu: 'm2 9 10-5 10 5-10 5L2 9Zm4 2.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M22 9v6',
  fit: 'M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12',
  paw: 'M7.5 17.5C7.5 15 9.5 13 12 13s4.5 2 4.5 4.5c0 1.5-1.2 2.5-2.5 2.5-1 0-1.3-.5-2-.5s-1 .5-2 .5c-1.3 0-2.5-1-2.5-2.5ZM3.9 11a1.6 1.6 0 1 0 3.2 0 1.6 1.6 0 1 0-3.2 0Zm3.5-3.5a1.6 1.6 0 1 0 3.2 0 1.6 1.6 0 1 0-3.2 0Zm6 0a1.6 1.6 0 1 0 3.2 0 1.6 1.6 0 1 0-3.2 0Zm3.5 3.5a1.6 1.6 0 1 0 3.2 0 1.6 1.6 0 1 0-3.2 0Z',
  glass: 'M4 4h16l-8 9-8-9Zm8 9v7m-4 0h8',
  cal: 'M4 6h16v14H4V6Zm0 4h16M8 3v4m8-4v4',
  wrench: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.8 3.8Z',
  bus: 'M5 4h14v13H5V4Zm0 7h14M8 20v-3m8 3v-3m-8-2.5h.01m7.99 0h.01',
  building: 'M4 21V5l8-2v18m0 0h8V9l-8-2M8 8h.01M8 12h.01M8 16h.01M16 12h.01M16 16h.01',
  bank: 'M3 10 12 4l9 6M5 10v8m4.5-8v8m5-8v8M19 10v8M3 20h18',
}
type IconName = keyof typeof ICONS

export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="icon">
      <path d={ICONS[name]} />
    </svg>
  )
}

// Group names come from the database ("Health & medical", "Home services"…); unknown ones get the card.
const GROUP_ICONS: [RegExp, IconName][] = [
  [/health|medic/, 'health'], [/home/, 'home'], [/restaurant|food|cafe/, 'food'], [/shop/, 'shop'], [/professional/, 'work'],
  [/beauty|spa/, 'beauty'], [/auto/, 'car'], [/hotel|travel/, 'bed'], [/educat/, 'edu'], [/transport/, 'bus'], [/active|fitness|sport/, 'fit'],
  [/pet/, 'paw'], [/night/, 'glass'], [/event/, 'cal'], [/financ/, 'bank'], [/real estate/, 'building'],
  [/service/, 'wrench'],
]

export function GroupIcon({ group, small }: { group: string; small?: boolean }) {
  const name = GROUP_ICONS.find(([re]) => re.test(group.toLowerCase()))?.[1] ?? 'card'
  return <span className={`gicon${small ? ' gicon-sm' : ''}`} aria-hidden="true"><Icon name={name} size={small ? 16 : 20} /></span>
}

// One of four placeholder tints per name, stable across pages.
const tint = (s: string) => `tint-${hash(s) % 4}`

// Rating as a ring gauge filled to rating / 5, with the number in the middle.
export function Rating({ rating, reviews, size = 'md' }: { rating?: number; reviews?: number; size?: 'sm' | 'md' | 'lg' }) {
  if (!rating) return <span className="rating rating-none">Not yet rated</span>
  return (
    <span className={`rating rating-${size}`} aria-label={`Rated ${rating.toFixed(1)} out of 5${reviews ? ` from ${num(reviews)} reviews` : ''}`}>
      <span className="ring" style={{ '--p': pct(rating) } as React.CSSProperties} aria-hidden="true"><b>{rating.toFixed(1)}</b></span>
      {reviews !== undefined && <small aria-hidden="true">{num(reviews)} {reviews === 1 ? 'review' : 'reviews'}</small>}
    </span>
  )
}

// ---------- chrome ----------

export function Header() {
  return (
    <header className="top">
      <div className="wrap top-bar">
        <Link href="/" className="brand" aria-label={`${SITE.name} home`}><Logo />{SITE.name}</Link>
        {/* The active tab needs the URL, which isn't known while unlisted pages prerender: plain tabs until then. */}
        <Suspense fallback={<NavTabs />}><ActiveNavTabs /></Suspense>
        <Link href="/add-a-business" className="btn btn-accent btn-sm top-cta">Add your business</Link>
      </div>
    </header>
  )
}

export async function Footer() {
  const [cities, trades] = await Promise.all([getCities(), getPopularNiches(6)])
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <Link href="/" className="brand brand-light"><Logo />{SITE.name}</Link>
            <p className="foot-blurb">{SITE.tagline}. Name, address, phone and opening hours, filed the same way for every business and free to use.</p>
          </div>
          <nav aria-label="Cities">
            <h2>Cities</h2>
            <ul>{cities.slice(0, 6).map(c => <li key={c.slug}><Link href={`/${c.slug}`}>{c.name}</Link></li>)}</ul>
          </nav>
          <nav aria-label="Popular categories">
            <h2>Categories</h2>
            <ul>{trades.map(n => <li key={n.slug}><Link href={`/categories/${n.slug}`}>{cap(plural(n.name))}</Link></li>)}</ul>
          </nav>
          <nav aria-label={SITE.name}>
            <h2>{SITE.name}</h2>
            <ul>
              <li><Link href="/add-a-business">Add your business</Link></li>
              <li><Link href="/about">How it works</Link></li>
              <li><Link href="/cities">All cities</Link></li>
              <li><Link href="/categories">All categories</Link></li>
              <li><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
            </ul>
          </nav>
        </div>
        <p className="foot-base">
          <span>© {SITE.name}. Compiled from public sources. Please confirm details with the business before you visit.</span>
          <span>No paid placement. No pay-to-rank.</span>
        </p>
      </div>
    </footer>
  )
}

export function Crumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="crumbs">
        {items.map((c, i) => (
          <li key={i}>{c.href ? <Link href={c.href}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}</li>
        ))}
      </ol>
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, ...(c.href && { item: `${SITE.url}${c.href}` }) })),
      }} />
    </nav>
  )
}

export type Stat = { label: string; value: ReactNode }

// Inner page head: a graphite band with breadcrumbs and title, and stat cards laid on it.
export function PageHead({ crumbs, eyebrow, title, lede, stats, children }: {
  crumbs: { name: string; href?: string }[]; eyebrow?: ReactNode; title: ReactNode; lede?: ReactNode; stats?: Stat[]; children?: ReactNode
}) {
  return (
    <section className="band">
      <div className="wrap">
        <Crumbs items={crumbs} />
        <div className={`band-grid${stats?.length ? '' : ' band-solo'}`}>
          <div className="band-copy">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1>{title}</h1>
            {lede && <p className="lede">{lede}</p>}
            {children}
          </div>
          {!!stats?.length && (
            <dl className="stat-cards">
              {stats.map(s => <div key={s.label} className="stat-card"><dt>{s.label}</dt><dd>{s.value}</dd></div>)}
            </dl>
          )}
        </div>
      </div>
    </section>
  )
}

export function SecHead({ eyebrow, title, sub, href, linkText = 'See all' }: { eyebrow?: string; title: string; sub?: ReactNode; href?: string; linkText?: string }) {
  return (
    <div className="sec-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {href && <Link href={href} className="more">{linkText} <Icon name="arrow" /></Link>}
    </div>
  )
}

export async function SearchBox({ q, loc }: { q?: string; loc?: string }) {
  const [trades, cities] = await Promise.all([getPopularNiches(200), getCities()])
  return (
    <form action="/search" className="finder" role="search">
      <label>
        <span>What</span>
        <span className="finder-in"><Icon name="search" /><input name="q" defaultValue={q} placeholder="Dentist, bakery, plumber…" list="dl-trades" autoComplete="off" /></span>
      </label>
      <label>
        <span>Where</span>
        <span className="finder-in"><Icon name="pin" /><input name="loc" defaultValue={loc} placeholder="City or neighbourhood" list="dl-places" autoComplete="off" /></span>
      </label>
      <button className="btn btn-accent">Find</button>
      <datalist id="dl-trades">{trades.map(n => <option key={n.slug} value={cap(n.name)} />)}</datalist>
      <datalist id="dl-places">{cities.map(c => <option key={c.slug} value={c.name}>{c.country}</option>)}</datalist>
    </form>
  )
}

export function JsonLd({ data }: { data: object }) {
  // Escape "<" so scraped text can't close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
}

// ---------- businesses ----------

export function Thumb({ b, size = 160, eager }: { b: Business; size?: number; eager?: boolean }) {
  const src = safeUrl(b.thumbnail)
  const initials = b.title.replace(/[^\p{L}\p{N} ]/gu, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return src
    // Plain img: Google photos are already sized by their URL (photoSize).
    ? <img className="thumb" src={photoSize(src, size, size)} alt="" width={size} height={size} loading={eager ? 'eager' : 'lazy'} referrerPolicy="no-referrer" />
    : <span className={`thumb thumb-blank ${tint(b.title)}`} aria-hidden="true">{initials || '•'}</span>
}

export const trade = (b: Business) => b.categories[0] ?? cap(b.niches[0] ?? '')

// A ranked entry: an index card whose tab carries its place in the list.
export function Entry({ b, n, showCity }: { b: Business; n: number; showCity?: boolean }) {
  const where = [b.area, showCity ? cityName(b.city) : undefined].filter(Boolean).join(', ')
  const web = safeUrl(b.website)
  return (
    <article className={`entry${n <= 3 ? ' entry-top' : ''}`} id={`e-${n}`}>
      <span className="tab">No. {n}</span>
      <Link href={`/biz/${b.slug}`} className="entry-thumb" tabIndex={-1} aria-hidden="true"><Thumb b={b} size={176} /></Link>
      <div className="entry-body">
        <h3><Link href={`/biz/${b.slug}`}>{b.title}</Link></h3>
        <p className="entry-meta">{[trade(b), where].filter(Boolean).join(' · ')}</p>
        <ul className="nap">
          <li><Icon name="pin" size={14} />{b.address}</li>
          {b.phone && <li><Icon name="phone" size={14} /><a href={telHref(b.phone)}>{b.phone}</a></li>}
          {web && <li><Icon name="globe" size={14} /><a href={web} rel="nofollow noopener" target="_blank">{hostname(web)}</a></li>}
        </ul>
        {b.user_review && <p className="quote">“{b.user_review.replace(/^"|"$/g, '')}”</p>}
      </div>
      <div className="entry-side">
        <Rating rating={b.rating} reviews={b.reviews} />
        <Link href={`/biz/${b.slug}`} className="btn btn-line btn-sm">View card <Icon name="arrow" size={14} /></Link>
      </div>
    </article>
  )
}

// A business as a printed card: who, where, how to reach them. The whole card is one link, so the phone is plain text.
export function BizCard({ b, eager }: { b: Business; eager?: boolean }) {
  return (
    <Link href={`/biz/${b.slug}`} className="bcard">
      <span className="tab">{trade(b)}</span>
      <span className="bcard-top">
        <Thumb b={b} size={112} eager={eager} />
        <span className="bcard-name">
          <b>{b.title}</b>
          <small>{[b.area, cityName(b.city)].filter(Boolean).join(', ')}</small>
        </span>
        <Rating rating={b.rating} size="sm" />
      </span>
      <span className="bcard-nap">
        <span><Icon name="pin" size={14} /><span className="clip">{b.address}</span></span>
        {b.phone && <span><Icon name="phone" size={14} />{b.phone}</span>}
      </span>
    </Link>
  )
}

// Small rows for sidebars: thumb, name, rating.
export function MiniList({ items, fallback }: { items: Business[]; fallback: string }) {
  return (
    <ul className="mini">
      {items.map(s => (
        <li key={s.key}>
          <Link href={`/biz/${s.slug}`}>
            <Thumb b={s} size={88} />
            <span className="mini-text">
              <b>{s.title}</b>
              <small>{s.area ?? fallback}</small>
            </span>
            <Rating rating={s.rating} size="sm" />
          </Link>
        </li>
      ))}
    </ul>
  )
}

// "Dentists in Pune" and "Dentists in Kothrud, Pune": ranked entries, with a summary and neighbourhoods beside them.
export async function ListingView({ citySlug, nicheSlug, niche, city, items, areas, area }: {
  citySlug: string; nicheSlug: string; niche: string; city: string; items: Business[]; areas: AreaCount[]; area?: AreaCount
}) {
  const [cityTrades, elsewhere] = await Promise.all([getCityCategories(citySlug), getCategoryCities(nicheSlug)])
  const place = area ? `${area.name}, ${cityName(city)}` : cityName(city)
  const title = `${cap(plural(niche))} in ${place}`
  const base = `/${citySlug}/${nicheSlug}`
  const rated = items.filter(b => b.rating)
  const avg = rated.length ? rated.reduce((s, b) => s + b.rating!, 0) / rated.length : 0
  const share = (n: number) => `${Math.round((n / items.length) * 100)}%`

  return (
    <>
      <PageHead
        crumbs={[
          { name: 'Home', href: '/' }, { name: cityName(city), href: `/${citySlug}` },
          ...(area ? [{ name: cap(plural(niche)), href: base }, { name: area.name }] : [{ name: cap(plural(niche)) }]),
        ]}
        eyebrow="Ranked by rating and review count"
        title={title}
        lede={<>{items.length} {plural(niche)} in {place}. Each rating is weighed against how many people gave it, so a handful of perfect scores can’t outrank hundreds of very good ones.</>}
        stats={[
          { label: `${plural(niche)} listed`, value: num(items.length) },
          ...(avg ? [{ label: 'average rating out of 5', value: avg.toFixed(1) }] : []),
        ]}
      />
      <div className="wrap listing">
        <div className="entries">{items.map((b, i) => <Entry key={b.key} b={b} n={i + 1} />)}</div>
        <aside className="side">
          <section className="panel">
            <h2>At a glance</h2>
            <dl className="glance">
              <div><dt>With a phone</dt><dd>{share(items.filter(b => b.phone).length)}</dd></div>
              <div><dt>With a website</dt><dd>{share(items.filter(b => safeUrl(b.website)).length)}</dd></div>
              <div><dt>Rated 4.5+</dt><dd>{items.filter(b => (b.rating ?? 0) >= 4.5).length}</dd></div>
              <div><dt>Reviews</dt><dd>{num(items.reduce((s, b) => s + b.reviews, 0))}</dd></div>
            </dl>
          </section>
          {areas.length > 0 && (
            <section className="panel">
              <h2>By neighbourhood</h2>
              <ul className="index-list">
                {area && <li><Link href={base}>All of {cityName(city)}</Link></li>}
                {areas.map(a => (
                  <li key={a.slug}>
                    <Link href={`${base}/${a.slug}`} aria-current={a.slug === area?.slug ? 'page' : undefined}>{a.name}<span>{a.count}</span></Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
      <section className="sec">
        <div className="wrap related">
          <section className="panel">
            <h2>More in {cityName(city)}</h2>
            <ul className="chips">
              {cityTrades.filter(t => t.slug !== nicheSlug).slice(0, 24).map(t => (
                <li key={t.slug}><Link href={`/${citySlug}/${t.slug}`}>{cap(plural(t.name))}<span>{t.count}</span></Link></li>
              ))}
            </ul>
          </section>
          <section className="panel">
            <h2>{cap(plural(niche))} in other cities</h2>
            <ul className="chips">
              {elsewhere.filter(c => c.slug !== citySlug).slice(0, 24).map(c => (
                <li key={c.slug}><Link href={`/${c.slug}/${nicheSlug}`}>{c.name}<span>{c.count}</span></Link></li>
              ))}
            </ul>
          </section>
        </div>
      </section>
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'ItemList', name: title, numberOfItems: items.length,
        itemListElement: items.slice(0, 50).map((b, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE.url}/biz/${b.slug}`, name: b.title })),
      }} />
    </>
  )
}

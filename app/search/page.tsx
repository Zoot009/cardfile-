import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Entry, Icon, PageHead, SearchBox } from '@/components/ui'
import { getSampleLists, search } from '@/lib/data'
import { PAGE_SIZE } from '@/lib/site'
import { cap, num, one, plural } from '@/lib/utils'

export const metadata: Metadata = { title: 'Search', robots: { index: false, follow: true } }

export default function SearchPage({ searchParams }: PageProps<'/search'>) {
  return (
    <Suspense fallback={<div className="wrap"><p className="panel empty">Searching the file…</p></div>}>
      <Results searchParams={searchParams} />
    </Suspense>
  )
}

const SORTS = [['', 'Best match'], ['rating', 'Rating'], ['reviews', 'Most reviewed']] as const
const RATINGS = [['', 'Any rating'], ['4.5', '4.5+'], ['4', '4.0+']] as const

async function Results({ searchParams }: Pick<PageProps<'/search'>, 'searchParams'>) {
  const sp = await searchParams
  const p = { q: one(sp.q)?.trim() ?? '', loc: one(sp.loc)?.trim() ?? '', sort: one(sp.sort) ?? '', rating: one(sp.rating) ?? '' }
  const page = Math.max(1, Math.floor(Number(one(sp.page))) || 1)
  const href = (o: Partial<typeof p> & { page?: number }) =>
    `/search?${new URLSearchParams(Object.entries({ ...p, ...o }).filter(([, v]) => v).map(([k, v]) => [k, String(v)]))}`

  const head = (
    <PageHead crumbs={[{ name: 'Home', href: '/' }, { name: 'Search' }]} title="Search the file">
      <SearchBox q={p.q} loc={p.loc} />
    </PageHead>
  )

  if (!p.q && !p.loc && !p.sort) return <>{head}<Suggestions /></>

  const { results, total } = await search({ ...p, page })
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const what = [p.q && `“${p.q}”`, p.loc && `in ${p.loc}`].filter(Boolean).join(' ')

  return (
    <>
      {head}
      <div className="wrap">
        <div className="toolbar">
          <p><b className="num">{num(total)}</b> {total === 1 ? 'card' : 'cards'} {what}</p>
          <nav aria-label="Sort and filter">
            <div className="seg">{SORTS.map(([v, label]) => <Link key={v} href={href({ sort: v, page: 1 })} aria-current={p.sort === v || undefined}>{label}</Link>)}</div>
            <div className="seg">{RATINGS.map(([v, label]) => <Link key={v} href={href({ rating: v, page: 1 })} aria-current={p.rating === v || undefined}>{label}</Link>)}</div>
          </nav>
        </div>
        {results.length ? (
          <>
            <div className="entries">{results.map((b, i) => <Entry key={b.key} b={b} n={(page - 1) * PAGE_SIZE + i + 1} showCity />)}</div>
            {pages > 1 && (
              <nav className="pager" aria-label="Pages">
                {page > 1 ? <Link href={href({ page: page - 1 })} className="btn btn-line btn-sm">← Previous</Link> : <span />}
                <span className="num">Page {page} of {num(pages)}</span>
                {page < pages ? <Link href={href({ page: page + 1 })} className="btn btn-line btn-sm">Next →</Link> : <span />}
              </nav>
            )}
          </>
        ) : (
          <div className="panel empty">
            <h2>Nothing on file {what}.</h2>
            <p>Try a broader category, or leave “Where” blank to search every city.</p>
          </div>
        )}
      </div>
    </>
  )
}

// Before a search: lists people often open, and how the two fields work.
async function Suggestions() {
  const samples = await getSampleLists(9)
  return (
    <div className="wrap suggest">
      <section className="panel">
        <h2>Often opened</h2>
        <ul className="index-list index-list-long">
          {samples.map(l => (
            <li key={`${l.city}/${l.category}`}>
              <Link href={`/${l.city}/${l.category}`}>{cap(plural(l.trade))} in {l.cityName}<span>{l.count} <Icon name="arrow" size={14} /></span></Link>
            </li>
          ))}
        </ul>
      </section>
      <dl className="panel tips">
        <dt>What</dt>
        <dd>A kind of business, like “dentist” or “car repair”, or part of a business name.</dd>
        <dt>Where</dt>
        <dd>A city, neighbourhood or street. Leave it blank to search everywhere.</dd>
        <dt>Order</dt>
        <dd>Results come ranked by rating weighed against review count. Re-sort by rating alone or by number of reviews.</dd>
        <dt>Or browse</dt>
        <dd><Link href="/categories">All categories</Link> · <Link href="/cities">All cities</Link></dd>
      </dl>
    </div>
  )
}

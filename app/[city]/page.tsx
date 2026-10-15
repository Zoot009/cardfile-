import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Entry, GroupIcon, PageHead, SearchBox, SecHead } from '@/components/ui'
import { getCities, getCity, getCityAreas, getCityCategories, getTopRated } from '@/lib/data'
import { cap, num, plural } from '@/lib/utils'

// The busiest cities are built ahead of time; the rest render on their first visit and are then cached.
export async function generateStaticParams() {
  return (await getCities()).slice(0, 40).map(c => ({ city: c.slug }))
}

export async function generateMetadata({ params }: PageProps<'/[city]'>): Promise<Metadata> {
  const c = await getCity((await params).city)
  if (!c) return {}
  return {
    title: `Local businesses in ${c.name}`,
    description: `${num(c.count)} local businesses in ${c.label}, across ${c.categories} categories: addresses, phone numbers, hours and ratings.`,
    alternates: { canonical: `/${c.slug}` },
  }
}

export default async function CityPage({ params }: PageProps<'/[city]'>) {
  const c = await getCity((await params).city)
  if (!c) notFound()
  const [trades, areas, top] = await Promise.all([getCityCategories(c.slug), getCityAreas(c.slug), getTopRated(6, c.slug)])
  const byGroup = [...Map.groupBy(trades, t => t.group)]

  return (
    <>
      <PageHead
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Cities', href: '/cities' }, { name: c.name }]}
        eyebrow={c.label === c.name ? c.country : `${c.label} · ${c.country}`}
        title={<>Local businesses in {c.name}</>}
        lede={`Ranked lists for ${trades.length} kinds of business in ${c.name}, with the address, phone and hours for each.`}
        stats={[
          { label: 'businesses listed', value: num(c.count) },
          { label: 'ranked categories', value: trades.length },
        ]}
      >
        <SearchBox loc={c.name} />
      </PageHead>

      <section className="sec">
        <div className="wrap">
          <SecHead eyebrow="Categories" title={`What’s on file in ${c.name}`} sub="Each list is ranked by rating and review count. The current leader is named under it." />
          <div className="city-groups">
            {byGroup.map(([group, list]) => (
              <section key={group} className="panel">
                <header className="panel-head"><GroupIcon group={group} small /><h3>{group}</h3></header>
                <ul className="trade-list">
                  {list.map(t => (
                    <li key={t.slug}>
                      <Link href={`/${c.slug}/${t.slug}`}>
                        <b>{cap(plural(t.name))}</b><span>{t.count}</span>
                        {t.top && <small>No. 1: {t.top}</small>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>

      {areas.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <SecHead eyebrow="Neighbourhoods" title={`Search ${c.name} by area`} />
            <ul className="chips">
              {areas.map(a => (
                <li key={a.slug}><Link href={`/search?loc=${encodeURIComponent(`${a.name}, ${c.name}`)}`}>{a.name}<span>{a.count}</span></Link></li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {top.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <SecHead eyebrow="Highly rated" title={`${c.name}’s best-reviewed businesses`} href={`/search?loc=${encodeURIComponent(c.name)}&sort=rating`} linkText="More" />
            <div className="entries">{top.map((b, i) => <Entry key={b.key} b={b} n={i + 1} />)}</div>
          </div>
        </section>
      )}
    </>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { CityFilter } from '@/components/client'
import { PageHead } from '@/components/ui'
import { getCities } from '@/lib/data'
import { fold, num } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'All cities',
  description: 'Every city in the directory, country by country, with how many local businesses each has.',
  alternates: { canonical: '/cities' },
}

const initial = (s: string) => fold(s).charAt(0).toUpperCase()

// Countries A–Z behind letter dividers, with a thumb index down the side like a phone book's.
export default async function CitiesPage() {
  const cities = await getCities()
  const countries = [...Map.groupBy(cities, c => c.country)].sort(([a], [b]) => a.localeCompare(b))
  const letters = Map.groupBy(countries, ([country]) => initial(country))

  return (
    <>
      <PageHead
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Cities' }]}
        eyebrow={`${cities.length} cities in ${countries.length} countries`}
        title="Pick a city"
        lede="Each city has ranked lists by category and neighbourhood, with the address, phone and hours for every business."
        stats={[
          { label: 'businesses listed', value: num(cities.reduce((s, c) => s + c.count, 0)) },
          { label: 'countries', value: countries.length },
        ]}
      >
        <CityFilter total={cities.length} />
      </PageHead>
      <div className="wrap atlas">
        <nav className="thumb-index" aria-label="Countries A to Z" data-letter>
          {[...letters.keys()].map(l => <a key={l} href={`#az-${l}`}>{l}</a>)}
        </nav>
        <div className="atlas-body">
          {[...letters].map(([letter, group]) => (
            <section key={letter} id={`az-${letter}`} className="atlas-letter" aria-label={letter}>
              <h2 className="divider" data-letter><b>{letter}</b><span>{group.length} {group.length === 1 ? 'country' : 'countries'}</span></h2>
              <div className="atlas-grid">
                {group.map(([country, list]) => (
                  <section key={country} className="panel atlas-country" data-country>
                    <header>
                      <span className="code" aria-hidden="true">{list[0].countryCode.toUpperCase()}</span>
                      <div>
                        <h3>{country}</h3>
                        <p>{list.length} {list.length === 1 ? 'city' : 'cities'} · {num(list.reduce((s, c) => s + c.count, 0))} businesses</p>
                      </div>
                    </header>
                    <ul className="index-list">
                      {list.map(c => (
                        <li key={c.slug} data-name={fold(`${c.name} ${c.label} ${country}`)}>
                          <Link href={`/${c.slug}`}>{c.name}<span>{num(c.count)}</span></Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </section>
          ))}
          <div className="panel empty none-found" hidden><h2>No city by that name yet.</h2><p>Check the spelling, or search by country.</p></div>
        </div>
      </div>
    </>
  )
}

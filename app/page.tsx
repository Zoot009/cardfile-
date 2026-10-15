import Link from 'next/link'
import { BizCard, GroupIcon, Icon, JsonLd, Rating, SearchBox, SecHead, Thumb, trade } from '@/components/ui'
import { getCategoryGroups, getCities, getSampleLists, getTopRated, getTotals } from '@/lib/data'
import { SITE } from '@/lib/site'
import { cap, cityName, hostname, num, plural, safeUrl } from '@/lib/utils'

export default async function Home() {
  const [t, cities, groups, top, routes] = await Promise.all([
    getTotals(), getCities(), getCategoryGroups(), getTopRated(12), getSampleLists(4),
  ])
  const categories = groups.reduce((s, g) => s + g.niches.length, 0)
  const countries = new Set(cities.map(c => c.country)).size
  const deck = top.slice(0, 3)
  const sample = top.find(b => b.phone) ?? top[0]
  const sampleWeb = safeUrl(sample?.website)
  const sampleHours = sample?.operating_hours && Object.entries(sample.operating_hours)[0]
  const biggest = Math.max(1, ...cities.slice(0, 8).map(c => c.count))

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Free local business directory</p>
            <h1>Every local business, on <em>one clear card.</em></h1>
            <p className="lede">
              Name, address, phone and opening hours for {num(t.businesses)} businesses in {cities.length} cities, filed the same way
              everywhere and ranked by what customers actually say.
            </p>
            <SearchBox />
            {routes.length > 0 && (
              <p className="popular">
                <span>Often opened</span>
                {routes.map(r => <Link key={`${r.city}/${r.category}`} href={`/${r.city}/${r.category}`}>{cap(plural(r.trade))} in {r.cityName}</Link>)}
              </p>
            )}
          </div>
          {deck.length > 0 && (
            <div className="deck" aria-label="Top-rated businesses">
              {deck.map((b, i) => <BizCard key={b.key} b={b} eager={i === 0} />)}
              <p className="deck-note">Top of the file right now</p>
            </div>
          )}
        </div>
        <div className="wrap">
          <dl className="tally">
            <div><dt>businesses</dt><dd>{num(t.businesses)}</dd></div>
            <div><dt>cities</dt><dd>{num(cities.length)}</dd></div>
            <div><dt>countries</dt><dd>{countries}</dd></div>
            <div><dt>categories</dt><dd>{categories}</dd></div>
            <div><dt>reviews weighed</dt><dd>{num(t.reviews)}</dd></div>
          </dl>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <SecHead eyebrow="Browse the drawers" title="Find the right kind of business" sub="Every category, filed under the group you’d look for it in." href="/categories" linkText={`All ${categories} categories`} />
          {/* Radio tabs: one group open at a time with no script, and every category link stays in the HTML. */}
          <div className="drawer">
            {groups.slice(0, 7).map((g, i) => (
              <div key={g.slug} className="drawer-group">
                <input type="radio" name="drawer" id={`dr-${g.slug}`} defaultChecked={i === 0} />
                <label htmlFor={`dr-${g.slug}`}><GroupIcon group={g.name} small />{g.name}</label>
                <div className="drawer-panel">
                  <p className="drawer-sum">{num(g.niches.reduce((s, n) => s + n.count, 0))} businesses in {g.niches.length} categories</p>
                  <ul className="drawer-list">
                    {[...g.niches].sort((a, b) => b.count - a.count).slice(0, 12).map(n => (
                      <li key={n.slug}>
                        <Link href={`/categories/${n.slug}`}><b>{cap(plural(n.name))}</b><span>{num(n.count)}</span></Link>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/categories#${g.slug}`} className="more">Everything in {g.name} <Icon name="arrow" /></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {sample && (
        <section className="sec sec-tint">
          <div className="wrap anatomy">
            <div>
              <SecHead eyebrow="Anatomy of a listing" title="Four details, written one way, everywhere." />
              <p className="lede-dark">
                Customers, maps and search engines compare a business’s details across the web. When they match, people trust them and find
                the door. Every {SITE.name} card files them in the same order.
              </p>
              <ol className="legend">
                <li><b>1</b><div><h3>Name</h3><p>Exactly as it appears on the door, without keywords stuffed in.</p></div></li>
                <li><b>2</b><div><h3>Address</h3><p>Full street address, with the neighbourhood that locals use.</p></div></li>
                <li><b>3</b><div><h3>Phone</h3><p>One number that a person answers, ready to tap.</p></div></li>
                <li><b>4</b><div><h3>Hours &amp; web</h3><p>When it’s open and where to read more, as the business publishes them.</p></div></li>
              </ol>
            </div>
            <article className="spec">
              <span className="tab">{trade(sample)}</span>
              <header>
                <Thumb b={sample} size={128} />
                <div>
                  <h3 className="spec-name"><i>1</i>{sample.title}</h3>
                  <p>{[sample.area, cityName(sample.city)].filter(Boolean).join(', ')}</p>
                </div>
                <Rating rating={sample.rating} reviews={sample.reviews} />
              </header>
              <dl>
                <div><dt><i>2</i>Address</dt><dd>{sample.address}</dd></div>
                {sample.phone && <div><dt><i>3</i>Phone</dt><dd>{sample.phone}</dd></div>}
                {(sampleHours || sampleWeb) && (
                  <div>
                    <dt><i>4</i>{sampleHours ? 'Hours' : 'Web'}</dt>
                    <dd>{sampleHours ? `${cap(sampleHours[0])}: ${sampleHours[1]}` : hostname(sampleWeb!)}{sampleHours && sampleWeb && <><br />{hostname(sampleWeb)}</>}</dd>
                  </div>
                )}
              </dl>
              <Link href={`/biz/${sample.slug}`} className="more">Open this card <Icon name="arrow" /></Link>
            </article>
          </div>
        </section>
      )}

      <section className="sec">
        <div className="wrap">
          <SecHead eyebrow="The cabinet" title="Start with a city" sub="Each city has its own drawer: categories, neighbourhoods and its highest-rated businesses." href="/cities" linkText={`All ${cities.length} cities`} />
          <ul className="cabinet">
            {cities.slice(0, 8).map(c => (
              <li key={c.slug}>
                <Link href={`/${c.slug}`} className="drawer-front">
                  <span className="label-holder">
                    <small>{c.countryCode.toUpperCase()} · {c.country}</small>
                    <b>{c.name}</b>
                  </span>
                  <span className="fill" aria-hidden="true"><i style={{ width: `${(c.count / biggest) * 100}%` }} /></span>
                  <span className="drawer-meta">{num(c.count)} businesses · {c.categories} lists</span>
                  <span className="handle" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {top.length > 3 && (
        <section className="sec">
          <div className="wrap">
            <SecHead eyebrow="Highly rated" title="Loved by hundreds of reviewers" sub="High ratings from a lot of people, anywhere in the directory." href="/search?sort=rating" linkText="Search by rating" />
            <div className="bcards">{top.slice(3, 12).map(b => <BizCard key={b.key} b={b} />)}</div>
          </div>
        </section>
      )}

      <section className="sec">
        <div className="wrap">
          <div className="cta">
            <div>
              <p className="eyebrow">Free listing</p>
              <h2>Missing from the file? Add your card.</h2>
              <p>Give your name, address and phone exactly as you want them to read everywhere. It takes a few minutes and costs nothing.</p>
            </div>
            <div className="actions">
              <Link href="/add-a-business" className="btn btn-accent">Add your business <Icon name="arrow" /></Link>
              <Link href="/about" className="btn btn-ghost">How listings are checked</Link>
            </div>
          </div>
        </div>
      </section>

      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: SITE.url,
        potentialAction: { '@type': 'SearchAction', target: `${SITE.url}/search?q={q}`, 'query-input': 'required name=q' },
      }} />
    </>
  )
}

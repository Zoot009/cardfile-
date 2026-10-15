import type { Metadata } from 'next'
import Link from 'next/link'
import { GroupIcon, PageHead } from '@/components/ui'
import { getCategoryGroups } from '@/lib/data'
import { cap, num, plural } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'All categories',
  description: 'Every category in the directory, group by group, with how many local businesses and city lists each has.',
  alternates: { canonical: '/categories' },
}

export default async function CategoriesPage() {
  const groups = (await getCategoryGroups()).map(g => ({ ...g, total: g.niches.reduce((s, n) => s + n.count, 0) }))
  const total = groups.reduce((s, g) => s + g.niches.length, 0)
  return (
    <>
      <PageHead
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Categories' }]}
        eyebrow={`${total} categories in ${groups.length} groups`}
        title="Browse by category"
        lede="Choose a category to see every city where it has a ranked list."
      >
        <nav className="jump" aria-label="Groups">
          {groups.map(g => <a key={g.slug} href={`#${g.slug}`}>{g.name}</a>)}
        </nav>
      </PageHead>
      <div className="wrap cat-groups">
        {groups.map(g => (
          <section key={g.slug} id={g.slug} className="folder">
            <h2 className="folder-tab"><GroupIcon group={g.name} small />{g.name}</h2>
            <div className="folder-body">
              <p className="folder-sum">{g.niches.length} {g.niches.length === 1 ? 'category' : 'categories'} · {num(g.total)} businesses</p>
              <ul className="cat-grid">
                {[...g.niches].sort((a, b) => b.count - a.count).map(n => (
                  <li key={n.slug}>
                    <Link href={`/categories/${n.slug}`}>
                      <b>{cap(plural(n.name))}</b>
                      <small>{num(n.count)} listed · ranked in {n.lists} {n.lists === 1 ? 'city' : 'cities'}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>
    </>
  )
}

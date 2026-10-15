import type { Metadata } from 'next'
import { ListingForm } from '@/components/client'
import { Icon, PageHead } from '@/components/ui'
import { getCategoryGroups, getCities } from '@/lib/data'
import { cap } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Add your business',
  description: 'Add a local business to the directory. Free, and checked by a person before it is published.',
  alternates: { canonical: '/add-a-business' },
}

export default async function AddBusinessPage() {
  const [groups, cities] = await Promise.all([getCategoryGroups({ includeEmpty: true }), getCities()])
  return (
    <>
      <PageHead
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Add your business' }]}
        eyebrow="Free listing · checked by a person"
        title="Add your business"
        lede="Give your name, address and phone exactly as you want them to appear everywhere. Listings usually go live within a few days."
      />
      <div className="wrap add">
        <div className="panel">
          <ListingForm
            categories={groups.flatMap(g => g.niches.map(n => cap(n.name)))}
            cities={cities.map(c => ({ name: c.name, country: c.country }))}
          />
        </div>
        <aside className="add-side">
          <h2>Why one card matters</h2>
          <p>Customers, maps and search engines compare your details across the web. When they match everywhere, people trust them and find you.</p>
          <ul className="checks">
            <li><Icon name="check" />Free, with no upsell</li>
            <li><Icon name="check" />Read by a person before it’s published</li>
            <li><Icon name="check" />Ranked like everyone else: nobody can pay for a higher place</li>
          </ul>
        </aside>
      </div>
    </>
  )
}

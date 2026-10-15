import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHead } from '@/components/ui'
import { getCities, getTotals } from '@/lib/data'
import { SITE } from '@/lib/site'
import { num } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'How it works',
  description: `How ${SITE.name} collects, ranks and corrects its listings of local businesses.`,
  alternates: { canonical: '/about' },
}

const STEPS = [
  ['What a card holds', <>Name, address and phone number: the three details customers, maps and search engines check against each other. Each card also carries the website, opening hours, category, neighbourhood and map position where they’re known.</>],
  ['Where it comes from', <>Listings are compiled from public map listings and refreshed periodically. Ratings and review counts are those published on Google. We don’t sell placement and we don’t accept payment for rank.</>],
  ['How lists are ranked', <>Each rating is weighed against how many people gave it, so a handful of perfect scores can’t outrank hundreds of very good ones. Lists with fewer than five businesses aren’t published.</>],
  ['Additions and corrections', <>Owners can <Link href="/add-a-business">add a missing business</Link>; a person reads every request before it’s published. To correct a card, write to <a href={`mailto:${SITE.email}`}>{SITE.email}</a> with the link to its page.</>],
] as const

export default async function AboutPage() {
  const [t, cities] = await Promise.all([getTotals(), getCities()])
  return (
    <>
      <PageHead
        crumbs={[{ name: 'Home', href: '/' }, { name: 'How it works' }]}
        eyebrow="About"
        title={`How ${SITE.name} works`}
        lede={<>{SITE.name} files {num(t.businesses)} local businesses in {cities.length} cities: who they are, where they are and how to reach them, one card each, in one consistent format.</>}
        stats={[
          { label: 'businesses', value: num(t.businesses) },
          { label: 'reviews weighed', value: num(t.reviews) },
        ]}
      />
      <ol className="wrap about">
        {STEPS.map(([title, body], i) => (
          <li key={title} className="panel">
            <span className="tab">{String(i + 1).padStart(2, '0')}</span>
            <h2>{title}</h2>
            <p>{body}</p>
          </li>
        ))}
      </ol>
    </>
  )
}

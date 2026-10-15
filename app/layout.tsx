import type { Metadata } from 'next'
import { Red_Hat_Display, Red_Hat_Mono, Red_Hat_Text } from 'next/font/google'
import { Footer, Header } from '@/components/ui'
import { SITE } from '@/lib/site'
import './globals.css'

// One family in three cuts: Display for headings, Text for reading, Mono for the card details (addresses, phones, counts).
const display = Red_Hat_Display({ variable: '--font-display', subsets: ['latin', 'latin-ext'] })
const text = Red_Hat_Text({ variable: '--font-text', subsets: ['latin', 'latin-ext'] })
const mono = Red_Hat_Mono({ variable: '--font-mono', subsets: ['latin', 'latin-ext'] })

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: 'Free local business directory: names, addresses, phone numbers, opening hours and fair rankings for local businesses, city by city.',
  openGraph: { siteName: SITE.name, type: 'website' },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable} ${mono.variable}`}>
      <body>
        <a href="#main" className="skip">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

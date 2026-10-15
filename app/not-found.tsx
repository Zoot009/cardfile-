import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="band band-tall">
      <div className="wrap band-copy">
        <p className="eyebrow">Error 404</p>
        <h1>No card filed under this address.</h1>
        <p className="lede">The page may have moved, or the business may no longer be listed.</p>
        <div className="actions">
          <Link href="/search" className="btn btn-accent">Search the directory</Link>
          <Link href="/" className="btn btn-ghost">Back to the start</Link>
        </div>
      </div>
    </section>
  )
}

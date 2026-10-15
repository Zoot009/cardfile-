'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useActionState, useState } from 'react'
import { submitBusiness, type FormState } from '@/lib/actions'
import { fold } from '@/lib/utils'
import { LISTING_RULES, cityRule, type Rules } from '@/lib/validate'

const NAV = [['/cities', 'Cities'], ['/categories', 'Categories'], ['/search', 'Search'], ['/about', 'How it works']] as const

// Header links drawn as file tabs; the current section's tab joins the page below it.
export function NavTabs({ path }: { path?: string }) {
  return (
    <nav className="tabs" aria-label="Main">
      {NAV.map(([href, label]) => {
        const here = path === href || path?.startsWith(`${href}/`)
        return <Link key={href} href={href} aria-current={here ? 'page' : undefined}>{label}</Link>
      })}
    </nav>
  )
}

export function ActiveNavTabs() {
  return <NavTabs path={usePathname()} />
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="btn btn-line btn-sm"
      onClick={() => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) })}
    >
      {copied ? 'Copied ✓' : 'Copy name, address & phone'}
    </button>
  )
}

// Narrows /cities as you type by hiding what doesn't match, so the list itself stays plain server HTML.
export function CityFilter({ total }: { total: number }) {
  const [shown, setShown] = useState(total)
  const filter = (q: string) => {
    const words = fold(q).split(/\s+/).filter(Boolean)
    let n = 0
    for (const group of document.querySelectorAll<HTMLElement>('[data-country]')) {
      let any = false
      for (const card of group.querySelectorAll<HTMLElement>('[data-name]')) {
        const hit = words.every(w => card.dataset.name!.includes(w))
        card.hidden = !hit
        if (hit) { any = true; n++ }
      }
      group.hidden = !any
    }
    // The A–Z dividers only make sense over the full list.
    for (const el of document.querySelectorAll<HTMLElement>('[data-letter]')) el.hidden = words.length > 0
    const none = document.querySelector<HTMLElement>('.none-found')
    if (none) none.hidden = n > 0
    setShown(n)
  }
  return (
    <div className="city-filter" role="search">
      <label htmlFor="find-city">Find a city</label>
      <input id="find-city" type="search" placeholder="Lisbon, Pune, Texas…" autoComplete="off" onChange={e => filter(e.target.value)} />
      <output htmlFor="find-city" aria-live="polite">{shown === total ? `${total} cities` : `${shown} of ${total}`}</output>
    </div>
  )
}

type Option = { name: string; country: string }

function Field({ name, label, optional, hint, error, wide, textarea, ...input }: {
  name: string; label: string; optional?: boolean; hint?: string; error?: string; wide?: boolean; textarea?: boolean
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const describedBy = [hint && `${name}-hint`, error && `${name}-err`].filter(Boolean).join(' ') || undefined
  const props = { id: name, name, 'aria-invalid': !!error || undefined, 'aria-describedby': describedBy }
  return (
    <div className={`field${wide ? ' wide' : ''}`}>
      <label htmlFor={name}>{label}{optional && <em>Optional</em>}</label>
      {textarea
        ? <textarea {...props} defaultValue={input.defaultValue as string} placeholder={input.placeholder} rows={4} />
        : <input {...props} {...input} />}
      {hint && <span className="hint" id={`${name}-hint`}>{hint}</span>}
      {error && <span className="err" id={`${name}-err`}>{error}</span>}
    </div>
  )
}

// The browser checks each field when you leave it, with the same rules the server applies (lib/validate.ts).
export function ListingForm({ categories, cities }: { categories: string[]; cities: Option[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, fd) => {
    const next = await submitBusiness(prev, fd)
    setLocal({})
    return next
  }, null)
  const [local, setLocal] = useState<Record<string, string>>({})
  const rules: Rules = { ...LISTING_RULES, city: cityRule(cities) }
  const v = state?.values ?? {}
  // A field checked in the browser since the last submit shows that result ('' = fine); otherwise the server's.
  const err = (k: string) => (k in local ? local[k] : state?.errors?.[k]) || undefined
  // Leaving a field checks it; typing in a field that shows an error re-checks it, so the message clears while you fix it
  // rather than on blur (a message vanishing on blur shifts the button between mousedown and mouseup, losing the click).
  const recheck = (always: boolean) => (e: React.SyntheticEvent<HTMLFormElement>) => {
    const t = e.target as unknown as HTMLInputElement
    const rule = rules[t.name]
    if (rule && (always || err(t.name))) setLocal(l => ({ ...l, [t.name]: rule(t.value.trim()) }))
  }

  if (state?.ok) {
    return (
      <div className="notice ok" role="status">
        <b>Thanks, your card is in the queue.</b>
        <p>{state.message}</p>
      </div>
    )
  }

  return (
    <form action={action} onBlur={recheck(true)} onChange={recheck(false)} noValidate key={JSON.stringify(v)} className="form">
      {state && !state.ok && <div className="notice" role="alert"><b>Not sent yet.</b><p>{state.message}</p></div>}
      <input className="trap" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <fieldset>
        <legend><span>Side A</span>Your business</legend>
        <div className="form-grid">
          <Field name="name" label="Business name" defaultValue={v.name} error={err('name')} autoComplete="organization" wide />
          <Field name="category" label="Category" defaultValue={v.category} error={err('category')} list="form-trades" placeholder="Dentist" hint="Pick from the list, or type your own." />
          <Field name="city" label="City" defaultValue={v.city} error={err('city')} list="form-cities" placeholder="Pune" />
          <Field name="address" label="Street address" defaultValue={v.address} error={err('address')} autoComplete="street-address" wide />
          <Field name="area" label="Neighbourhood" optional defaultValue={v.area} error={err('area')} />
          <Field name="phone" label="Phone" optional defaultValue={v.phone} error={err('phone')} type="tel" autoComplete="tel" />
          <Field name="website" label="Website" optional defaultValue={v.website} error={err('website')} placeholder="example.com" inputMode="url" />
          <Field name="hours" label="Opening hours" optional defaultValue={v.hours} error={err('hours')} placeholder="Mon–Sat 9 AM–6 PM" />
          <Field name="description" label="Short description" optional defaultValue={v.description} error={err('description')} textarea wide />
        </div>
      </fieldset>

      <fieldset>
        <legend><span>Side B</span>About you</legend>
        <div className="form-grid">
          <Field name="contact_name" label="Your name" defaultValue={v.contact_name} error={err('contact_name')} autoComplete="name" />
          <Field name="email" label="Email" defaultValue={v.email} error={err('email')} type="email" autoComplete="email" hint="Only used to tell you when the listing is live." />
          <div className="field wide">
            <span className="label">Your connection to the business</span>
            <div className="radios">
              {[['owner', 'Owner'], ['employee', 'Employee'], ['customer', 'Customer']].map(([value, label]) => (
                <label key={value}><input type="radio" name="relationship" value={value} defaultChecked={(v.relationship || 'owner') === value} />{label}</label>
              ))}
            </div>
          </div>
        </div>
      </fieldset>

      <button className="btn btn-accent" disabled={pending}>{pending ? 'Sending…' : 'Submit for review'}</button>
      <datalist id="form-trades">{categories.map(c => <option key={c} value={c} />)}</datalist>
      <datalist id="form-cities">{cities.map(c => <option key={`${c.name}-${c.country}`} value={`${c.name}, ${c.country}`} />)}</datalist>
    </form>
  )
}

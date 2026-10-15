import assert from 'node:assert/strict'
import { test } from 'node:test'
import { hash, pct, plural, safeUrl } from './utils.ts'

test('placeholder tints are stable per name and spread across all four', () => {
  assert.equal(hash('Kothrud Dental'), hash('Kothrud Dental'))
  assert.equal(new Set('abcdefghijklmnop'.split('').map(s => hash(s) % 4)).size, 4)
})

test('rating rings stay within 0–100%', () => {
  assert.equal(pct(4.7), '94%')
  assert.equal(pct(), '0%')
  assert.equal(pct(9), '100%')
})

test('plurals for headings', () => {
  assert.equal(plural('dentist'), 'dentists')
  assert.equal(plural('pharmacy'), 'pharmacies')
  assert.equal(plural('car wash'), 'car washes')
  assert.equal(plural('car repair'), 'car repair')
})

test('only http(s) links from scraped data', () => {
  assert.equal(safeUrl('javascript:alert(1)'), undefined)
  assert.equal(safeUrl('https://example.com'), 'https://example.com')
})

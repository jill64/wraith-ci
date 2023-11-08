import { expect, test } from 'vitest'

import { pickAttribute } from './pickAttribute.js'

test('success', () => {
  const src = '<!----- BEGIN GHOST DOCS LOGO src="./path/to/logo.png" ----->'
  const expected = './path/to/logo.png'
  const actual = pickAttribute({
    source: src,
    section: 'LOGO',
    key: 'src'
  })
  expect(actual).toBe(expected)
})

test('error', () => {
  const src = '<!---- BEGIN GHOST DOCS LOGO ---->'
  const expected = './path/to/logo.png'
  const actual = pickAttribute({
    source: src,
    section: 'LOGO',
    key: 'src'
  })
  expect(actual).not.toBe(expected)
})

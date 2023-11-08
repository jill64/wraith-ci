import { expect, test } from 'vitest'

import { replaceSection } from './replaceSection.js'

test('success', () => {
  const source = /*html*/ `
Pre Header
<!----- BEGIN GHOST DOCS HEADER ----->

<!----- END GHOST DOCS HEADER ----->
Post Header
`

  const content = /*md*/ `
# My Awesome Project

Description of my awesome project
`

  const expected = /*html*/ `
Pre Header
<!----- BEGIN GHOST DOCS HEADER ----->

# My Awesome Project

Description of my awesome project

<!----- END GHOST DOCS HEADER ----->
Post Header
`

  const result = replaceSection({ source, section: 'HEADER', content })

  expect(result).toBe(expected)
})

test('success - zero span', () => {
  const source = /*html*/ `<!----- BEGIN GHOST DOCS HEADER -----><!----- END GHOST DOCS HEADER ----->`

  const content = /*md*/ `
# My Awesome Project

Description of my awesome project
`

  const expected = /*html*/ `<!----- BEGIN GHOST DOCS HEADER ----->

# My Awesome Project

Description of my awesome project

<!----- END GHOST DOCS HEADER ----->`

  const result = replaceSection({ source, section: 'HEADER', content })

  expect(result).toBe(expected)
})

test('error', () => {
  const source = /*html*/ `
Pre Header
<!----- BEGIN GHOST DOCS HEADER ----->
Post Header
`

  const content = /*md*/ `
# My Awesome Project

Description of my awesome project
`

  const expected = /*html*/ `
Pre Header
<!----- BEGIN GHOST DOCS HEADER ----->

# My Awesome Project

Description of my awesome project

<!----- END GHOST DOCS HEADER ----->
Post Header
`

  const result = replaceSection({ source, section: 'HEADER', content })

  expect(result).not.toBe(expected)
})

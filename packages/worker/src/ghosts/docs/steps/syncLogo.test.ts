import { expect, test } from 'vitest'
import { syncLogo } from './syncLogo.js'

test('success', () => {
  const source = /*html*/ `
<!----- BEGIN GHOST DOCS LOGO src="./path/to/logo.png" ----->

<!----- END GHOST DOCS LOGO ----->
`

  const expected = /*html*/ `
<!----- BEGIN GHOST DOCS LOGO src="./path/to/logo.png" ----->

<div align="center">
<img src="./path/to/logo.png" width="100px" />
</div>

<!----- END GHOST DOCS LOGO ----->
`

  const result = syncLogo(source)

  expect(result).toBe(expected)
})

test('success - zero space', () => {
  const source = /*html*/ `<!----- BEGIN GHOST DOCS LOGO src="./path/to/logo.png" -----><!----- END GHOST DOCS LOGO ----->`

  const expected = /*html*/ `<!----- BEGIN GHOST DOCS LOGO src="./path/to/logo.png" ----->

<div align="center">
<img src="./path/to/logo.png" width="100px" />
</div>

<!----- END GHOST DOCS LOGO ----->`

  const result = syncLogo(source)

  expect(result).toBe(expected)
})

test('error', () => {
  const source = /*html*/ `
<!----- BEGIN GHOST DOCS LOGO ----->

<!----- END GHOST DOCS LOGO ----->
`

  const expected = /*html*/ `
<!----- BEGIN GHOST DOCS LOGO src="./path/to/logo.png" ----->

<!-- attribute "src" is not found -->

<!----- END GHOST DOCS LOGO ----->
`

  const result = syncLogo(source)

  expect(result).not.toBe(expected)
})

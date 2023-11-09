import { expect, test } from 'vitest'
import { updateOutput } from './updateOutput.js'

test('updateOutput', () => {
  const result = updateOutput({
    ghost_name: 'build',
    result: 'success',
    output: {
      title: '✅ Lint | ⌛️ Build | ✅ Test',
      summary: `
| Ghost | Status    | Detail          |
| ----- | --------- | --------------- |
| Build | ⌛️ bridged |  |
| Lint  | ✅ success | Test Detail     |
| Test  | ✅ success |                 |
`
    }
  })

  expect(result).toStrictEqual({
    title: '✅ Lint | ✅ Build | ✅ Test',
    summary: `
| Ghost | Status    | Detail          |
| ----- | --------- | --------------- |
| Build | ✅ success |  |
| Lint  | ✅ success | Test Detail     |
| Test  | ✅ success |                 |
`
  })
})

test('updateOutput - failure', () => {
  const result = updateOutput({
    ghost_name: 'lint',
    result: {
      status: 'failure',
      detail: 'Test Detail'
    },
    output: {
      title: '✅ Lint',
      summary: `
| Ghost | Status    | Detail          |
| ----- | --------- | --------------- |
| Build | ⌛️ bridged |                 |
| Lint | ✅ success |                 |
| Test | ✅ success |                 |
`
    }
  })

  expect(result).toStrictEqual({
    title: '❌ Lint',
    summary: `
| Ghost | Status    | Detail          |
| ----- | --------- | --------------- |
| Build | ⌛️ bridged |                 |
| Lint | ❌ failure | Test Detail |
| Test | ✅ success |                 |
`
  })
})

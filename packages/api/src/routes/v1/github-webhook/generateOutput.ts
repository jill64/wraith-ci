import { getGhostAlias } from '$lib/getGhostAlias.js'
import { getStatusEmoji } from '$lib/getStatusEmoji.js'
import type { WraithStatus } from '$lib/types/WraithStatus.js'

export const generateOutput = (wraith_status: WraithStatus) => {
  const entries = Object.entries(wraith_status)

  const title = entries
    .map(([name, status]) => `${getStatusEmoji(status)} ${getGhostAlias(name)}`)
    .join(' | ')

  const header = `
| Ghost | Status | Detail |
| ----- | ------ | ------ |
`

  const body = entries
    .map(
      ([name, status]) =>
        `| ${getGhostAlias(name)} | ${getStatusEmoji(status)} ${
          status.status
        } | ${status.detail ?? ''} |`
    )
    .join('\n')

  const summary = `${header}${body}\n`

  return {
    title,
    summary
  }
}

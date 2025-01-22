import { getGhostAlias } from '$shared/ghost/getGhostAlias.js'
import { getStatusEmoji } from '$shared/ghost/getStatusEmoji.js'
import type { WraithStatus } from '$shared/ghost/types/WraithStatus.js'

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

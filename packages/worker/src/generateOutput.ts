import { getGhostAlias } from '@/shared/src/getGhostAlias.js'
import { getStatusEmoji } from '@/shared/src/getStatusEmoji.js'
import { WraithStatus } from '@/shared/types/WraithStatus.js'
import { ChecksOutput } from 'octoflare'

export const generateOutput = (wraith_status: WraithStatus): ChecksOutput => {
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

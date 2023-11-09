import { getStatusEmoji } from '@/shared/src/getStatusEmoji.js'
import { schema } from '@/shared/src/schema.js'
import { GhostName } from '@/shared/types/GhostName.js'
import { GhostStatusShortHand } from '@/shared/types/GhostStatusShortHand.js'
import { ChecksOutput } from 'octoflare'

export const updateOutput = ({
  ghost_name,
  result,
  output
}: {
  ghost_name: GhostName
  result: GhostStatusShortHand
  output: {
    title: string
    summary: string
  }
}): ChecksOutput => {
  const alias = schema[ghost_name].alias
  const ghost_status = typeof result === 'string' ? { status: result } : result
  const status_emoji = getStatusEmoji(ghost_status)

  const title = output.title.replace(
    new RegExp(`\\S* ${alias}`),
    `${status_emoji} ${alias}`
  )

  const summary = output.summary.replace(
    new RegExp(`\\| ${alias} \\| .* \\| .* \\|`),
    `| ${alias} | ${status_emoji} ${ghost_status.status} | ${
      ghost_status.detail ?? ''
    } |`
  )

  return {
    title,
    summary
  }
}

import { getStatusEmoji } from './getStatusEmoji.js'
import { schema } from './schema.js'
import { GhostStatusShortHand } from './GhostStatusShortHand.js'
import { Payload } from '../types/Payload.js'

export const updateOutput = ({
  ghost_name,
  result,
  output
}: {
  ghost_name: Payload['ghost']
  result: GhostStatusShortHand
  output: {
    title: string | null
    summary: string | null
  }
}) => {
  const alias = schema[ghost_name].alias
  const ghost_status = typeof result === 'string' ? { status: result } : result
  const status_emoji = getStatusEmoji(ghost_status)

  const title = output.title?.replace(
    new RegExp(`\\S* ${alias}`),
    `${status_emoji} ${alias}`
  )

  const name = alias

  const detail = (ghost_status.detail?.replace(/[|]/g, '') ?? '').split('\n')[0]

  const summary = output.summary?.replace(
    new RegExp(`\\| ${alias} \\| .* \\| .* \\|`),
    `| ${name} | ${status_emoji} ${ghost_status.status} | ${detail} |`
  )

  return {
    title,
    summary
  }
}

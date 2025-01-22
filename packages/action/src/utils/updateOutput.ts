import { getStatusEmoji } from '$shared/ghost/getStatusEmoji.js'
import { schema } from '$shared/ghost/schema.js'
import { GhostName } from '$shared/ghost/types/GhostName.js'
import { GhostStatusShortHand } from '$shared/ghost/types/GhostStatusShortHand.js'
import { ChecksOutput } from 'octoflare'

export const updateOutput = ({
  ghost_name,
  result,
  output,
  job_url
}: {
  ghost_name: GhostName
  result: GhostStatusShortHand
  output: {
    title: string
    summary: string
  }
  job_url: string | undefined | null
}): ChecksOutput => {
  const alias = schema[ghost_name].alias
  const ghost_status = typeof result === 'string' ? { status: result } : result
  const status_emoji = getStatusEmoji(ghost_status)

  const title = output.title.replace(
    new RegExp(`\\S* ${alias}`),
    `${status_emoji} ${alias}`
  )

  const name = job_url ? `[${alias}](${job_url})` : alias

  const detail = (ghost_status.detail?.replace(/[|]/g, '') ?? '').split('\n')[0]

  const summary = output.summary.replace(
    new RegExp(`\\| ${alias} \\| .* \\| .* \\|`),
    `| ${name} | ${status_emoji} ${ghost_status.status} | ${detail} |`
  )

  return {
    title,
    summary
  }
}

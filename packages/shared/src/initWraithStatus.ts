import { ChecksOutput } from 'octoflare'
import { GhostName } from '../types/GhostName.js'
import { GhostStatus } from '../types/GhostStatus.js'
import { GhostStatusShortHand } from '../types/GhostStatusShortHand.js'
import { WraithStatus } from '../types/WraithStatus.js'
import { isGhostName } from './isGhostName.js'
import { schema } from './schema.js'

const statusEmoji = ({ status }: GhostStatus) =>
  status === 'processing'
    ? '⏳'
    : status === 'bridged'
    ? '⌛️'
    : status === 'success'
    ? '✅'
    : status === 'failure'
    ? '❌'
    : '〰'

const ghostAlias = (name: string) =>
  isGhostName(name) ? schema[name].alias : name

export const initWraithStatus = (init: WraithStatus) => {
  const wraith_status = init

  const get = () => wraith_status

  const update = (name: GhostName, status: GhostStatusShortHand) => {
    const value = typeof status === 'string' ? { status } : status
    Object.defineProperty(wraith_status, name, value)
  }

  const generateOutput = (): ChecksOutput => {
    const entries = Object.entries(wraith_status)

    const title = entries
      .map(([name, status]) => `${ghostAlias(name)} ${statusEmoji(status)} `)
      .join(' | ')

    const header = `
| Ghost | Status | Detail |
| ----- | ------ | ------ |
`

    const body = entries
      .map(
        ([name, status]) =>
          `| ${ghostAlias(name)} | ${statusEmoji(status)} ${status.status} | ${
            status.detail ?? ''
          } |`
      )
      .join('\n')

    const summary = `${header}${body}\n`

    return {
      title,
      summary
    }
  }

  const getResults = () =>
    Object.values(wraith_status).map(({ status }) => status)

  return {
    get,
    update,
    getResults,
    generateOutput
  }
}

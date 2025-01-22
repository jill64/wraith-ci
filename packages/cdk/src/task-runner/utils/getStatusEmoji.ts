import { GhostStatus } from './GhostStatus.js'

export const getStatusEmoji = ({ status }: GhostStatus) =>
  status === 'processing'
    ? '⏳'
    : status === 'success'
      ? '✅'
      : status === 'failure'
        ? '❌'
        : 'ー'

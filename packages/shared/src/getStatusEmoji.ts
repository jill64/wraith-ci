import { GhostStatus } from '@/shared/types/GhostStatus.js'

export const getStatusEmoji = ({ status }: GhostStatus) =>
  status === 'processing'
    ? '⏳'
    : status === 'bridged'
    ? '⌛️'
    : status === 'success'
    ? '✅'
    : status === 'failure'
    ? '❌'
    : '-'

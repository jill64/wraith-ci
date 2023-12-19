import { TriggerEvent } from '../types/TriggerEvent.js'

export const schema = {
  build: {
    alias: 'Build',
    trigger: 'push',
    action: true
  },
  deploy: {
    alias: 'Deploy',
    trigger: 'push_main',
    action: true
  },
  docs: {
    alias: 'Docs',
    trigger: 'push'
  },
  format: {
    alias: 'Format',
    trigger: 'push',
    action: true
  },
  lint: {
    alias: 'Lint',
    trigger: 'push',
    action: true
  },
  merge: {
    alias: 'Auto Merge',
    trigger: 'pull_request'
  },
  release: {
    alias: 'Release',
    trigger: 'push_main',
    action: true
  },
  bump: {
    alias: 'Version Bump',
    trigger: 'pull_request'
  },
  assign: {
    alias: 'Reviewer Assign',
    trigger: 'pull_request'
  },
  derive: {
    alias: 'Derive',
    trigger: 'push_main'
  }
} satisfies Record<
  string,
  {
    alias: string
    trigger: TriggerEvent
    action?: boolean
  }
>

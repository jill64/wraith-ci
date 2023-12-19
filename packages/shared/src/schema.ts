import { TriggerEvent } from '../types/TriggerEvent.js'

export const schema = {
  build: {
    alias: 'Build',
    trigger: 'push'
  },
  deploy: {
    alias: 'Deploy',
    trigger: 'push_main'
  },
  docs: {
    alias: 'Docs',
    trigger: 'push'
  },
  format: {
    alias: 'Format',
    trigger: 'push',
    skip_bot: true
  },
  lint: {
    alias: 'Lint',
    trigger: 'push'
  },
  merge: {
    alias: 'Auto Merge',
    trigger: 'pull_request'
  },
  release: {
    alias: 'Release',
    trigger: 'push_main'
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
    skip_bot?: boolean
  }
>

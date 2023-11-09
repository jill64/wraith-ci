export type GhostStatus =
  | {
      status: 'processing' | 'success' | 'bridged' | 'skipped'
      detail?: string
    }
  | {
      status: 'failure'
      detail: string
    }

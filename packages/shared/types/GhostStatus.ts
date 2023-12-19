export type GhostStatus =
  | {
      status: 'processing' | 'success' | 'skipped'
      detail?: string
    }
  | {
      status: 'failure'
      detail: string
    }

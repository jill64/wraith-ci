export type Payload = {
  ghost:
    | 'build'
    | 'docs'
    | 'format'
    | 'lint'
    | 'merge'
    | 'release'
    | 'bump'
    | 'assign'
  pull_number: number | null
  head_sha: string
  ref: string
  check_run_id: number
  installation_id: number
  owner: string
  repo: string
  url: string
}

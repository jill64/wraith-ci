import { GhostName } from '@/shared/types/GhostName.js'
import { Ghost } from '../types/Ghost.js'
import { assign } from './ghosts/assign.js'
import { build } from './ghosts/build.js'
import { bump } from './ghosts/bump/index.js'
import { deploy } from './ghosts/deploy.js'
import { derive } from './ghosts/derive.js'
import { docs } from './ghosts/docs/index.js'
import { format } from './ghosts/format.js'
import { lint } from './ghosts/lint.js'
import { merge } from './ghosts/merge/index.js'
import { release } from './ghosts/release.js'

export const apps = {
  build,
  deploy,
  docs,
  format,
  lint,
  merge,
  release,
  bump,
  assign,
  derive
} satisfies Record<GhostName, Ghost>

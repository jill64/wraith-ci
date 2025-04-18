import { GhostName } from '$shared/ghost/types/GhostName.js'
import { Ghost } from '../types/Ghost.js'
import { build } from './ghosts/build.js'
import { bump } from './ghosts/bump/index.js'
import { docs } from './ghosts/docs/index.js'
import { format } from './ghosts/format.js'
import { lint } from './ghosts/lint.js'
import { merge } from './ghosts/merge/index.js'
import { release } from './ghosts/release/index.js'
import { test } from './ghosts/test.js'

export const apps = {
  build,
  format,
  lint,
  release,
  docs,
  bump,
  merge,
  test
} satisfies Record<GhostName, Ghost>

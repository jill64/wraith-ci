import { GhostName } from '@/shared/types/GhostName.js'
import { Ghost } from '../types/Ghost.js'
import { build } from './ghosts/build.js'
import { deploy } from './ghosts/deploy.js'
import { format } from './ghosts/format.js'
import { lint } from './ghosts/lint.js'
import { release } from './ghosts/release.js'

export const apps = {
  build,
  deploy,
  format,
  lint,
  release
} satisfies Partial<Record<GhostName, Ghost>>

import { Ghost } from '@/types/Ghost.js'
import { build } from './app/build.js'
import { deploy } from './app/deploy.js'
import { docs } from './app/docs.js'
import { format } from './app/format.js'
import { lint } from './app/lint.js'
import { merge } from './app/merge.js'
import { release } from './app/release.js'

export const apps: Record<string, Ghost> = {
  build,
  deploy,
  docs,
  format,
  lint,
  merge,
  release
}

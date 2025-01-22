import { build } from 'esbuild'
import { cp } from 'node:fs/promises'
import path from 'node:path'

const exec = (name: string) =>
  Promise.all([
    build({
      entryPoints: [path.resolve('src', name, 'server.ts')],
      outfile: path.resolve('dist', name, 'server.js'),
      format: 'cjs',
      bundle: true,
      minify: true,
      platform: 'node',
      target: 'node20',
      external: ['node:*', '@aws-sdk/*']
    }),
    cp(
      path.resolve('src', name, 'Dockerfile'),
      path.resolve('dist', name, 'Dockerfile')
    )
  ])

await exec('task-runner')

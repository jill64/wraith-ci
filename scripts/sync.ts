import { schema } from '$shared/ghost/schema.js'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const filepath = path.join(__dirname, '../.github/workflows/wraith-ci.yml')

const str = await readFile(filepath, 'utf-8')

await writeFile(
  filepath,
  str.replace(/name: \[(.*)\]/, `name: [${Object.keys(schema).join(', ')}]`)
)

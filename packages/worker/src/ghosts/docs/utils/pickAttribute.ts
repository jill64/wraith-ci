import { BEGIN_FIRST, LAST_TAIL } from './snippets.js'

export const pickAttribute = ({
  source,
  section,
  key
}: {
  source: string
  section: 'HEADER' | 'LOGO'
  key: string
}) =>
  source.match(
    new RegExp(`${BEGIN_FIRST} ${section} ${key}="(.*)" ${LAST_TAIL}`)
  )?.[1] ?? null

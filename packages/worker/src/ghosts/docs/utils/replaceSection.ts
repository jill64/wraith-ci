import { BEGIN_FIRST, END_FIRST, LAST_TAIL } from './snippets.js'

export const replaceSection = ({
  source,
  section,
  content,
  key
}: {
  source: string
  section: 'HEADER'
  content: string
  key?: string
}) => {
  const begin = new RegExp(
    `${BEGIN_FIRST} ${section}${key ? ` ${key}=".*"` : ''} ${LAST_TAIL}`
  )

  const end = new RegExp(`${END_FIRST} ${section} ${LAST_TAIL}`)

  const beginMatch = source.match(begin)
  const endMatch = source.match(end)

  if (!(beginMatch?.index !== undefined && endMatch?.index !== undefined)) {
    return source
  }

  const beginIndex = beginMatch.index
  const endIndex = endMatch.index + endMatch[0].length

  return (
    source.substring(0, beginIndex) +
    `${beginMatch[0]}
${content}
${endMatch[0]}` +
    source.substring(endIndex)
  )
}

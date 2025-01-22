import { tagBegin, tagEnd } from './snippets.js'

export const replaceSection = ({
  source,
  section,
  content
}: {
  source: string
  section: 'HEADER' | 'FOOTER'
  content: string
}) => {
  const begin = new RegExp(tagBegin(section))
  const end = new RegExp(tagEnd(section))

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

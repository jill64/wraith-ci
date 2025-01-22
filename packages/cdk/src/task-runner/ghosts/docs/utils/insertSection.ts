import { tagBegin, tagEnd } from './snippets.js'

export const insertSection = (readme: string): string => {
  const beginHeader = tagBegin('HEADER')
  const endHeader = tagEnd('HEADER')

  const beginFooter = tagBegin('FOOTER')
  const endFooter = tagEnd('FOOTER')

  const headed =
    !readme.includes(beginHeader) || !readme.includes(endHeader)
      ? `${beginHeader}

${endHeader}

${readme}
`
      : readme

  const footed =
    !headed.includes(beginFooter) || !headed.includes(endFooter)
      ? `${headed}
${beginFooter}
${endFooter}
`
      : headed

  return footed
}

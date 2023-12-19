import { BEGIN_FIRST, END_FIRST, LAST_TAIL } from '../utils/snippets.js'

export const insertSection = (readme: string): string => {
  const beginHeader = BEGIN_FIRST + ' HEADER ' + LAST_TAIL
  const endHeader = END_FIRST + ' HEADER ' + LAST_TAIL

  const beginFooter = BEGIN_FIRST + ' FOOTER ' + LAST_TAIL
  const endFooter = END_FIRST + ' FOOTER ' + LAST_TAIL

  const headed =
    !readme.includes(beginHeader) || !readme.includes(endHeader)
      ? beginHeader + endHeader + readme
      : readme

  const footed =
    !headed.includes(beginFooter) || !headed.includes(endFooter)
      ? headed + beginFooter + endFooter
      : headed

  return footed
}

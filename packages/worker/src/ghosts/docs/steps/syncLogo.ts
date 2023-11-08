import { pickAttribute } from '../utils/pickAttribute.js'
import { replaceSection } from '../utils/replaceSection.js'

const NOT_FOUND_CODE = /*html*/ `
<!-- attribute "src" is not found -->
`

export const syncLogo = (readme: string) => {
  const src = pickAttribute({
    source: readme,
    section: 'LOGO',
    key: 'src'
  })

  if (!src) {
    return replaceSection({
      source: readme,
      section: 'LOGO',
      key: 'src',
      content: NOT_FOUND_CODE
    })
  }

  const content = /*html*/ `
<div align="center">
<img src="${src}" width="100px" />
</div>
`

  return replaceSection({
    source: readme,
    section: 'LOGO',
    key: 'src',
    content
  })
}

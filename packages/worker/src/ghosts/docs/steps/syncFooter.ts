import { Repository } from 'octoflare/webhook'
import { replaceSection } from '../utils/replaceSection.js'

export const syncFooter = ({
  readme,
  repository: { license }
}: {
  readme: string
  repository: Repository
}) => {
  if (!license) {
    return readme
  }

  return replaceSection({
    source: readme,
    section: 'FOOTER',
    content: `
## License

${license.spdx_id}
`
  })
}

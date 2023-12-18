import { Repository } from 'octoflare/webhook'
import { replaceSection } from '../utils/replaceSection.js'

export const syncFooter = ({
  readme,
  repository
}: {
  readme: string
  repository: Repository
}) =>
  replaceSection({
    source: readme,
    section: 'FOOTER',
    content: `
## License

${repository.license}
`
  })

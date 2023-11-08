import type { getExecOutput } from '@actions/exec'
import { CloseCheckParam } from 'octoflare'

export const failedSummary = (
  title: string,
  { stderr, stdout }: Awaited<ReturnType<typeof getExecOutput>>
): CloseCheckParam => ({
  conclusion: 'failure',
  output: {
    title,
    summary: `
## stdout

\`\`\`
${stdout}
\`\`\`

## stderr

\`\`\`
${stderr}
\`\`\`
`
  }
})

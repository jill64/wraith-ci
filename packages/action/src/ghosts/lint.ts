import { Ghost } from '@/action/types/Ghost.js'
import { attempt } from '@jill64/attempt'
import { writeFile } from 'fs/promises'
import { array, optional, scanner, string } from 'typescanner'
import { failedSummary } from '../utils/failedSummary.js'
import { run } from '../utils/run.js'
import { syncChanges } from '../utils/syncChanges.js'

export const lint: Ghost = async ({ payload, octokit }) => {
  const lintResult = await run('npm run lint')

  if (lintResult.exitCode === 0) {
    return 'success'
  }

  const isDepcheckError =
    lintResult.stdout.includes('Unused dependencies') ||
    lintResult.stdout.includes('Unused devDependencies')

  if (isDepcheckError) {
    const { stdout: packageJsonStr } = await run('cat package.json')

    const packageJson = attempt(
      () => JSON.parse(packageJsonStr) as unknown,
      null
    )

    const isValidPackageJson = scanner({
      dependencies: optional(scanner({})),
      devDependencies: optional(scanner({}))
    })

    if (!isValidPackageJson(packageJson)) {
      return {
        conclusion: 'failure',
        output: {
          title: 'Invalid Package.json',
          summary: JSON.stringify(packageJson, null, 2)
        }
      }
    }

    const depcheckResult = await run('npx depcheck --json')
    const result = JSON.parse(depcheckResult.stdout)

    const isValidResult = scanner({
      dependencies: array(string),
      devDependencies: array(string)
    })

    if (!isValidResult(result)) {
      return {
        conclusion: 'failure',
        output: {
          title: 'Invalid Depcheck Result',
          summary: depcheckResult.stdout
        }
      }
    }

    const omittedDeps = Object.fromEntries(
      Object.entries(packageJson.dependencies ?? {}).filter(
        ([key]) => !result.dependencies.includes(key)
      )
    )

    const omittedDevDeps = Object.fromEntries(
      Object.entries(packageJson.devDependencies ?? {}).filter(
        ([key]) => !result.devDependencies.includes(key)
      )
    )

    const omittedPackageJson = {
      ...packageJson,
      ...(Object.keys(omittedDeps).length ? { dependencies: omittedDeps } : {}),
      ...(Object.keys(omittedDevDeps).length
        ? { devDependencies: omittedDevDeps }
        : {})
    }

    await writeFile('package.json', JSON.stringify(omittedPackageJson, null, 2))

    await syncChanges({
      message: 'fix: omit unused dependencies',
      branch: 'wraith-ci/ghost-lint',
      octokit,
      payload
    })

    return {
      conclusion: 'failure',
      output: {
        title: 'Omitted Unused Dependencies',
        summary: 'New package.json has been pushed.'
      }
    }
  }

  return failedSummary('Lint Failed', lintResult)
}

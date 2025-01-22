import { Ghost } from '../../types/Ghost.js'
import { writeFile } from 'fs/promises'
import { array, optional, scanner, string } from 'typescanner'
import { getPackageJson } from '../utils/getPackageJson.js'
import { pushCommit } from '../utils/pushCommit.js'
import { run } from '../utils/run.js'

const isValidJson = scanner({
  scripts: scanner({
    lint: string
  })
})

export const lint: Ghost = async () => {
  const package_json = await getPackageJson()

  if (!package_json) {
    return {
      status: 'skipped',
      detail: 'Not found package.json in repo'
    }
  }

  if (!isValidJson(package_json)) {
    return {
      status: 'skipped',
      detail: 'Lint command not found in package.json'
    }
  }

  const lintResult = await run('npm run lint')

  if (lintResult.exitCode === 0) {
    return 'success'
  }

  const isDepcheckError =
    lintResult.stdout.includes('Unused dependencies') ||
    lintResult.stdout.includes('Unused devDependencies')

  if (isDepcheckError) {
    const isValidPackageJson = scanner({
      dependencies: optional(scanner({})),
      devDependencies: optional(scanner({}))
    })

    if (!isValidPackageJson(package_json)) {
      return {
        status: 'failure',
        detail: 'Invalid Package.json'
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
        status: 'failure',
        detail: 'Invalid Depcheck Result'
      }
    }

    const omittedDeps = Object.fromEntries(
      Object.entries(package_json.dependencies ?? {}).filter(
        ([key]) => !result.dependencies.includes(key)
      )
    )

    const omittedDevDeps = Object.fromEntries(
      Object.entries(package_json.devDependencies ?? {}).filter(
        ([key]) => !result.devDependencies.includes(key)
      )
    )

    const omittedPackageJson = {
      ...package_json,
      ...(Object.keys(omittedDeps).length ? { dependencies: omittedDeps } : {}),
      ...(Object.keys(omittedDevDeps).length
        ? { devDependencies: omittedDevDeps }
        : {})
    }

    await writeFile('package.json', JSON.stringify(omittedPackageJson, null, 2))

    await pushCommit('fix: omit unused dependencies')

    return {
      status: 'failure',
      detail: 'New package.json has been pushed'
    }
  }

  return {
    status: 'failure',
    detail: lintResult.stderr
  }
}

import { array, optional, scanner, string } from 'typescanner'

export const isValidPackageJson = scanner({
  name: optional(string),
  version: optional(string),
  files: optional(array(string)),
  description: optional(string),
  devDependencies: optional(
    scanner({
      octoflare: optional(string)
    })
  )
})

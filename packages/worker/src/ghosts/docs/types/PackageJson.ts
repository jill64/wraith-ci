import { isValidPackageJson } from '../utils/isValidPackageJson.js'

export type PackageJson = typeof isValidPackageJson extends (
  x: unknown
) => x is infer U
  ? U
  : never

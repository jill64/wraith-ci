import { tsConfig } from '@jill64/eslint-config-ts'

/** @type {import('@jill64/eslint-config-ts').FlatConfig[]} */
export default [
  {
    ignores: ['cdk.out']
  },
  ...tsConfig()
]

import { isGhostName } from '@/shared/src/isGhostName.js'
import { schema } from '@/shared/src/schema.js'

export const getGhostAlias = (name: string) =>
  isGhostName(name) ? schema[name].alias : name

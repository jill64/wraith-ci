import { isGhostName } from './isGhostName.js'
import { schema } from './schema.js'

export const getGhostAlias = (name: string) =>
  isGhostName(name) ? schema[name].alias : name

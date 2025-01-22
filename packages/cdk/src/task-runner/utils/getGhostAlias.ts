import { Payload } from '../types/Payload.js'
import { isGhostName } from './isGhostName.js'
import { schema } from './schema.js'

export const getGhostAlias = (name: Payload['ghost']) =>
  isGhostName(name) ? schema[name].alias : name

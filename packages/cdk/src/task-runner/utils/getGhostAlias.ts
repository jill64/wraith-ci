import { Payload } from '../types/Payload.js'
import { schema } from './schema.js'

export const getGhostAlias = (name: Payload['ghost']) => schema[name].alias

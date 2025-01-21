import { text } from '@sveltejs/kit'

export const created = (path: `/${string}`) =>
  text(path, {
    status: 201
  })

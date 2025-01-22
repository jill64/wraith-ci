import { text } from '@sveltejs/kit'

export const validated = (result: unknown) => text(result ? 'NG' : 'OK')

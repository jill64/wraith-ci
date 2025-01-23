import type { RequestEvent } from '@sveltejs/kit'

export const logout = ({ cookies }: RequestEvent) => {
  cookies.delete('auth', { path: '/' })
}

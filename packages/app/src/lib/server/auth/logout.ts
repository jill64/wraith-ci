import type { RequestEvent } from '@sveltejs/kit'

export const logout = async ({ cookies, locals: { kit } }: RequestEvent) => {
  cookies.delete('auth', { path: '/' })
  await Promise.all([
    kit.rest.apps.revokeInstallationAccessToken(),
    kit.rest.apps.removeRepoFromInstallationForAuthenticatedUser()
  ])
}

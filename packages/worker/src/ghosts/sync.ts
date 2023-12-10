import { Ghost } from '@/worker/types/Ghost.js'

export const sync: Ghost = async ({
  repo,
  owner,
  repository,
  installation
}) => {
  const repoInfoUpdate =
    repository.has_projects ||
    repository.has_wiki ||
    repository.allow_squash_merge ||
    repository.allow_rebase_merge ||
    !repository.allow_auto_merge ||
    !repository.delete_branch_on_merge ||
    !repository.allow_update_branch
      ? installation.kit.rest.repos.update({
          owner,
          repo,
          has_projects: false,
          has_wiki: false,
          allow_squash_merge: false,
          allow_rebase_merge: false,
          allow_auto_merge: true,
          delete_branch_on_merge: true,
          allow_update_branch: true
        })
      : null

  const branchProtectionUpdate = installation.kit.rest.repos
    .getBranchProtection({
      owner,
      repo,
      branch: 'main'
    })
    .then(({ data }) => {
      const contexts = data.required_status_checks?.contexts ?? []
      return !contexts.includes('Wraith CI') ||
        !contexts.includes('Wraith CI / PR') ||
        !contexts.includes('Socket Security: Project Report') ||
        !contexts.includes('Socket Security: Pull Request Alerts')
        ? installation.kit.rest.repos.updateBranchProtection({
            owner,
            repo,
            branch: 'main',
            required_status_checks: {
              strict: true,
              contexts: [
                ...new Set(
                  ...contexts,
                  'Wraith CI',
                  'Wraith CI / PR',
                  'Socket Security: Project Report',
                  'Socket Security: Pull Request Alerts'
                )
              ]
            },
            enforce_admins: true,
            required_pull_request_reviews: {
              required_approving_review_count: 0
            },
            restrictions: null,
            allow_deletions: false,
            lock_branch: false,
            allow_force_pushes: false
          })
        : null
    })

  const wfPermissionUpdate = installation.kit.rest.actions
    .getGithubActionsDefaultWorkflowPermissionsRepository({
      owner,
      repo
    })
    .then(({ data }) =>
      data.default_workflow_permissions !== 'read' ||
      data.can_approve_pull_request_reviews
        ? installation.kit.rest.actions.setGithubActionsDefaultWorkflowPermissionsRepository(
            {
              owner,
              repo,
              default_workflow_permissions: 'read',
              can_approve_pull_request_reviews: false
            }
          )
        : null
    )

  await Promise.allSettled([
    repoInfoUpdate,
    branchProtectionUpdate,
    wfPermissionUpdate
  ])

  return 'success'
}

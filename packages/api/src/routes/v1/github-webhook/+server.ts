import {
  OCTOFLARE_APP_ID,
  OCTOFLARE_APP_OWNER,
  OCTOFLARE_APP_REPO,
  OCTOFLARE_PRIVATE_KEY_PKCS8,
  OCTOFLARE_WEBHOOK_SECRET
} from '$env/static/private'
import { schema } from '$shared/ghost/schema'
import type { GhostName } from '$shared/ghost/types/GhostName'
import type { GhostStatus } from '$shared/ghost/types/GhostStatus'
import type { WraithPayload } from '$shared/ghost/types/WraithPayload'
import { attempt } from '@jill64/attempt'
import { error, text } from '@sveltejs/kit'
import { octoflare, type OctoflareEnv } from 'octoflare'
import { generateOutput } from './generateOutput'
import { isOwnerTransferred } from './isOwnerTransfered'
import { onPR } from './onPR'
import { onPRCommentEdited } from './onPRCommentEdited'
import { onPush } from './onPush'

export const POST = async ({ request, locals: { db } }) => {
  const fetcher = octoflare<WraithPayload>(
    async ({ payload, installation, app }) => {
      if (!installation) {
        error(500, 'Installation Not Found')
      }

      const is_push = 'commits' in payload
      const is_pull_request = 'pull_request' in payload && 'number' in payload
      const is_pr_comment_edited =
        'action' in payload &&
        payload.action === 'edited' &&
        'comment' in payload &&
        'issue' in payload

      if (!(is_pull_request || is_push || is_pr_comment_edited)) {
        return text('Skip Event: No Trigger Event')
      }

      const { repository } = payload

      const repo = repository.name
      const owner = repository.owner.login

      const context = {
        repo,
        owner,
        installation
      }

      const processed = await (is_push
        ? onPush(payload)
        : is_pull_request
          ? onPR(payload, context)
          : onPRCommentEdited(payload, context))

      if (processed instanceof Response) {
        return processed
      }

      const { ref, event, head_sha, pull_number, task } = processed

      if (
        repository.fork &&
        !(await isOwnerTransferred({
          octokit: installation.kit,
          owner,
          ref,
          repo
        }))
      ) {
        return text('Skip Event: Forked Repo')
      }

      if (!(head_sha && Number(head_sha) !== 0)) {
        return text('Skip Event: No Head SHA')
      }

      const send_by_bot = payload.sender.type === 'Bot'

      console.log('Processing:', { repo, owner, event, head_sha })

      const target_repo = await attempt(
        () =>
          db
            .selectFrom('repo')
            .select(['encrypted_envs'])
            .where('github_repo_id', '=', repository.id)
            .executeTakeFirst(),
        (e, o) => {
          console.error(e)
          throw o
        }
      )

      console.log('Target Repo:', target_repo)

      const triggered_ghosts = Object.entries(schema)
        .filter(([ghost, config]) => {
          const skip_bot = 'skip_bot' in config && config.skip_bot === true

          if (JSON.parse('[]').includes(ghost)) {
            return false
          }

          if (send_by_bot && skip_bot) {
            return false
          }

          const { trigger } = config

          return event === 'push_main'
            ? trigger === 'push_main' || trigger === 'push'
            : trigger === event
        })
        .map(([name]) => name as GhostName)

      console.log('Triggered Ghosts', triggered_ghosts)

      const wraith_status = Object.fromEntries(
        triggered_ghosts.map((name) => [
          name,
          { status: 'processing' } as GhostStatus
        ])
      )

      const { dispatchWorkflow, check_run_id } =
        await installation.createCheckRun({
          head_sha,
          owner,
          repo,
          name: `Wraith CI${event === 'pull_request' ? ' / PR' : ''}`,
          output: generateOutput(wraith_status)
        })

      const startPrivateWorkflow = async () => {
        const {
          data: { id: app_installation_id }
        } = await installation.kit.rest.apps.getRepoInstallation({
          owner: 'jill64',
          repo: 'wraith-ci-private'
        })

        const app_kit = await app.getInstallationOctokit(app_installation_id)

        const [token, app_token] = await Promise.all([
          installation.kit.rest.apps
            .createInstallationAccessToken({
              installation_id: installation.id
            })
            .then(({ data: { token } }) => token),
          app_kit.rest.apps
            .createInstallationAccessToken({
              installation_id: app_installation_id
            })
            .then(({ data: { token } }) => token)
        ])

        await app_kit.rest.actions.createWorkflowDispatch({
          repo: 'wraith-ci-private',
          owner: 'jill64',
          workflow_id: 'wraith-ci.yml',
          ref: 'main',
          inputs: {
            payload: JSON.stringify({
              token,
              app_token,
              repo,
              owner,
              check_run_id,
              data: {
                triggered_ghosts,
                head_sha,
                ref,
                pull_number,
                encrypted_envs: target_repo?.encrypted_envs
              }
            })
          }
        })
      }

      await Promise.all([
        task(),
        repository.private
          ? startPrivateWorkflow()
          : dispatchWorkflow({
              triggered_ghosts,
              head_sha,
              ref,
              pull_number,
              encrypted_envs: target_repo?.encrypted_envs
            })
      ])

      return text('Wraith CI Workflow Bridged', {
        status: 202
      })
    }
  )

  try {
    const res = await fetcher.fetch(request, {
      OCTOFLARE_APP_ID,
      OCTOFLARE_PRIVATE_KEY_PKCS8,
      OCTOFLARE_WEBHOOK_SECRET,
      OCTOFLARE_APP_OWNER,
      OCTOFLARE_APP_REPO
    } as Record<string, never> & OctoflareEnv)
    return res
  } catch (err) {
    error(500, (err as Error).message)
  }
}

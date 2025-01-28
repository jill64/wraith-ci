<script lang="ts">
  import { i } from '$lib/i18n'
  import { request } from '$lib/request.svelte.js'
  import { toast } from '@jill64/svelte-suite'
  import { GitMergeIcon } from '@jill64/svelte-suite/icons'
  import { CheckBox } from '@jill64/svelte-suite/input'

  let { ghost_merge_ignores }: { ghost_merge_ignores: string[] } = $props()

  let ignores = $state(ghost_merge_ignores)
</script>

<article>
  <hgroup class="flex items-center gap-2">
    <GitMergeIcon />
    <h3 class="text-3xl font-bold my-4">Ghost Merge</h3>
  </hgroup>
  <div class="flex flex-col gap-2">
    {#each ['owner', 'dependabot[bot]', 'renovate[bot]', 'wraith-ci[bot]'] as user}
      <CheckBox
        value={!ignores.includes(user)}
        onChange={(v) =>
          toast.promise(
            request.put('ghost/merge', {
              invalidate: () => true,
              body: JSON.stringify([
                ...ignores.filter((x) => x !== user),
                ...(v ? [] : [user])
              ])
            }),
            {
              loading: i.translate({
                en: 'Saving...',
                ja: '保存中...'
              }),
              success: i.translate({
                en: 'Saved',
                ja: '保存しました'
              }),
              error: i.translate({
                en: 'Failed to save',
                ja: '保存に失敗しました'
              })
            }
          )}
      >
        <span class="ml-2">{user}</span>
      </CheckBox>
    {/each}
  </div>
</article>

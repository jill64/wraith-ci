<script lang="ts">
  import { i } from '$lib/i18n'
  import { request } from '$lib/request.svelte.js'
  import type { GhostBumpConfig } from '$shared/ghost/types/GhostBumpConfig'
  import { TagIcon } from '@jill64/svelte-suite/icons'
  import { ActionButton } from '@jill64/svelte-suite/input'

  let { ghost_bump_configs }: { ghost_bump_configs: GhostBumpConfig } = $props()

  let ghostBumpConfig = $state(ghost_bump_configs)
  let bump_config_sending = $state(false)
</script>

<article>
  <hgroup class="flex items-center gap-2">
    <TagIcon />
    <h3 class="text-3xl font-bold my-4">Ghost Bump Config</h3>
  </hgroup>
  <div>
    <div class="inline-grid cols-auto-2 items-center gap-2">
      <div>Major</div>
      <input
        class="txt disabled:text-zinc-600 disabled:bg-zinc-300 disabled:dark:text-gray-500 disabled:dark:bg-gray-900"
        placeholder="major,breaking"
        bind:value={ghostBumpConfig.major}
        disabled={bump_config_sending}
      />
      <div>Minor</div>
      <input
        class="txt disabled:text-zinc-600 disabled:bg-zinc-300 disabled:dark:text-gray-500 disabled:dark:bg-gray-900"
        placeholder="minor,feat"
        bind:value={ghostBumpConfig.minor}
        disabled={bump_config_sending}
      />
      <div>Patch</div>
      <input
        class="txt disabled:text-zinc-600 disabled:bg-zinc-300 disabled:dark:text-gray-500 disabled:dark:bg-gray-900"
        placeholder="*"
        bind:value={ghostBumpConfig.patch}
        disabled={bump_config_sending}
      />
      <div>Skip</div>
      <input
        class="txt disabled:text-zinc-600 disabled:bg-zinc-300 disabled:dark:text-gray-500 disabled:dark:bg-gray-900"
        placeholder="chore"
        bind:value={ghostBumpConfig.skip}
        disabled={bump_config_sending}
      />
      <div>Cumulative Update</div>
      <input
        type="number"
        class="txt disabled:text-zinc-600 disabled:bg-zinc-300 disabled:dark:text-gray-500 disabled:dark:bg-gray-900"
        placeholder="50"
        bind:value={ghostBumpConfig.cumulative_update}
        disabled={bump_config_sending}
      />
    </div>
  </div>
  <ActionButton
    Class="btn main md mt-4"
    onClick={async () => {
      bump_config_sending = true

      await request.put('ghost/bump-config', {
        invalidate: () => true,
        body: JSON.stringify(ghostBumpConfig)
      })

      bump_config_sending = false
    }}
    label={i.translate({
      en: 'Save',
      ja: '保存'
    })}
    disabled={bump_config_sending}
  />
</article>

<style lang="postcss">
  input {
    @apply bg-inherit border rounded py-1 px-2;
  }
</style>

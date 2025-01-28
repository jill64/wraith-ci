<script lang="ts">
  import { page } from '$app/state'
  import NavigationMenu from '$lib/components/NavigationMenu.svelte'
  import { dict } from '$lib/dict.svelte'
  import { i } from '$lib/i18n'
  import EnvironmentVariable from './EnvironmentVariable.svelte'
  import GhostBumpConfig from './GhostBumpConfig.svelte'
  import GhostDocs from './GhostDocs.svelte'
  import GhostMerge from './GhostMerge.svelte'
  import GhostSettings from './GhostSettings.svelte'

  let { data } = $props()

  let repo = $derived(data.repository)
</script>

<NavigationMenu
  list={[
    { href: '/', text: dict('top') },
    {
      href: `/repos/${page.params.owner}`,
      text: i.translate({
        en: 'Repositories',
        ja: 'リポジトリ'
      })
    }
  ]}
/>

<main class="mx-4">
  <h2 class="text-5xl font-semibold mt-1 mb-4">{repo.name}</h2>
  <p>{repo.description}</p>
  <div class="flex flex-wrap gap-10">
    <EnvironmentVariable envs={data.envs} />
    <GhostSettings ignore_ghosts={data.ignore_ghosts} />
    <GhostBumpConfig ghost_bump_configs={data.ghost_bump_configs} />
    <GhostMerge ghost_merge_ignores={data.ghost_merge_ignores} />
    <GhostDocs ghost_docs_ignore_files={data.ghost_docs_ignore_files} />
  </div>
</main>

<style lang="postcss">
  input {
    @apply bg-inherit border rounded py-1 px-2;
  }
  th,
  td {
    @apply p-2;
  }
</style>

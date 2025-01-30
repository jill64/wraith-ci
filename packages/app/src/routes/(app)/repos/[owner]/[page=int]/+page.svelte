<script lang="ts">
  import GhostTag from '$lib/components/GhostTag.svelte'
  import { PaginateItems } from '@jill64/svelte-pagination'

  let { data } = $props()
  let ignore_ghosts = $derived(
    Object.fromEntries(
      data.ghostsForRepo.map((x) =>
        x.ignore_ghosts
          ? [x.github_repo_id, JSON.parse(x.ignore_ghosts) as string[]]
          : [x.github_repo_id, undefined]
      )
    )
  )
</script>

<main class="mx-4">
  <h2 class="text-2xl font-bold">Repositories</h2>
  {#each data.allRepo.data as repo}
    <a
      href={`/repos/${repo.owner.login}/details/${repo.name}`}
      class="block p-4 pp rounded-lg shadow-md dark:shadow-none dark:border-gray-500"
    >
      <hgroup class="flex items-center gap-3">
        <h3 class="text-xl font-bold">{repo.name}</h3>
        <GhostTag
          if={!ignore_ghosts[repo.id]?.includes('build')}
          label="Build"
          class="bg-[rgb(49,94,230)] dark:bg-[rgb(34,54,115)]"
        />
        <GhostTag
          if={!ignore_ghosts[repo.id]?.includes('lint')}
          label="Lint"
          class="bg-[rgb(220,61,183)] dark:bg-[rgb(135,57,117)]"
        />
        <GhostTag
          if={!ignore_ghosts[repo.id]?.includes('test')}
          label="Test"
          class="bg-[rgb(48,207,66)] dark:bg-[rgb(57,135,66)]"
        />
        <GhostTag
          if={!ignore_ghosts[repo.id]?.includes('docs')}
          label="Docs"
          class="bg-[rgb(56,213,219)] dark:bg-[rgb(57,132,135)]"
        />
        <GhostTag
          if={!ignore_ghosts[repo.id]?.includes('format')}
          label="Format"
          class="bg-[rgb(225,182,65)] dark:bg-[rgb(135,114,57)]"
        />
        <GhostTag
          if={!ignore_ghosts[repo.id]?.includes('merge')}
          label="Merge"
          class="bg-[rgb(111,55,223)] dark:bg-[rgb(83,57,135)]"
        />
        <GhostTag
          if={!ignore_ghosts[repo.id]?.includes('bump')}
          label="Bump"
          class="bg-[rgb(233,85,85)] dark:bg-[rrgb(135,57,57)]"
        />
        <GhostTag
          if={!ignore_ghosts[repo.id]?.includes('release')}
          label="Release"
          class="bg-[rgb(151,235,88)] dark:bg-[rgb(91,135,57)]"
        />
      </hgroup>
      <p>{repo.description}</p>
    </a>
  {:else}
    <p>No repositories found</p>
  {/each}
</main>

<div>
  <PaginateItems lastPage={data.lastPage} slug="[page=int]" />
</div>

<style lang="postcss">
  div {
    @apply flex items-center justify-center gap-2;
  }
  div :global(.paginate-page-link) {
    @apply text-[royalblue] hover:underline p-1.5 push-effect;
  }
  div :global(.paginate-navigation) {
    @apply text-[royalblue] hover:underline p-1.5 push-effect;
  }
  :global(.dark) {
    div :global(.paginate-page-link) {
      @apply text-blue-400 pop-effect;
    }
    div :global(.paginate-navigation) {
      @apply text-blue-400 pop-effect;
    }
  }
  div :global(.paginate-rest-indicator) {
    /* Rest Indicator (...) Style */
  }
  div :global(.paginate-current-page) {
    @apply p-1.5;
  }
</style>

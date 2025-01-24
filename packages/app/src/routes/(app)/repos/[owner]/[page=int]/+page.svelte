<script lang="ts">
  import { PaginateItems } from '@jill64/svelte-pagination'
  let { data } = $props()
</script>

<main class="mx-4">
  <h2 class="text-2xl font-bold">Repositories</h2>
  {#each data.allRepo.data as repo}
    <a
      href={`/repos/${repo.owner.login}/details/${repo.name}`}
      class="block p-4 hover:underline pp rounded-lg shadow-md dark:shadow-none dark:border-gray-500"
    >
      <h3 class="text-xl font-bold">{repo.name}</h3>
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

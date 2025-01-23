<script lang="ts">
  import { PaginateItems } from '@jill64/svelte-pagination'
  let { data } = $props()
</script>

<main class="mx-4">
  <h2 class="text-2xl font-bold">Repositories</h2>
  {#each data.allRepo.data as repo}
    <a
      href={`/repo/${repo.owner.login}/${repo.name}`}
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
    @apply link p-1.5 pp;
  }
  div :global(.paginate-navigation) {
    @apply link p-1.5 pp;
  }
  div :global(.paginate-rest-indicator) {
    /* Rest Indicator (...) Style */
  }
  div :global(.paginate-current-page) {
    @apply p-1.5;
  }
</style>

<script lang="ts">
  import { dict } from '$lib/dict.svelte'
  import { i } from '$lib/i18n'
  import { TabItems } from 'svelte-page-tab'

  let { children } = $props()
</script>

<main class="mx-4 min-h-screen">
  <h1 class="font-bold text-3xl my-2">
    {dict('documentation')}
  </h1>
  <div class="flex flex-wrap gap-6">
    <ul class="flex flex-col">
      <TabItems
        prefix="/docs"
        routes={new Map([
          ['', i.translate({ en: 'Getting Started', ja: 'はじめに' })],
          ['/env', 'Environment Variable'],
          ['/ghost/build', 'Ghost Build'],
          ['/ghost/lint', 'Ghost Lint'],
          ['/ghost/test', 'Ghost Test'],
          ['/ghost/format', 'Ghost Format'],
          ['/ghost/docs', 'Ghost Docs'],
          ['/ghost/merge', 'Ghost Merge'],
          ['/ghost/bump', 'Ghost Bump'],
          ['/ghost/release', 'Ghost Release']
        ])}
      />
    </ul>
    <div>
      {@render children()}
    </div>
  </div>
</main>

<style lang="postcss">
  ul :global(a) {
    @apply py-2 px-4 border-l-2 border-transparent hover:border-zinc-500;
  }
  ul :global(a[data-current-location]) {
    @apply border-black dark:border-white;
  }
  :global(code) {
    @apply bg-gray-100 dark:bg-gray-700 rounded p-1;
  }
</style>

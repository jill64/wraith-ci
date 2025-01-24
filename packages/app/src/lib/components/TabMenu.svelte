<script lang="ts">
  import { TabItems } from 'svelte-page-tab'

  let {
    prefix,
    routes
  }: {
    prefix?: string
    vertical?: boolean
    routes: [string, string][]
  } = $props()
</script>

<ul class="flex items-center overflow-x-auto">
  <TabItems {prefix} routes={new Map(routes)}>
    {#snippet children(item)}
      <span class="whitespace-nowrap">{item}</span>
    {/snippet}
  </TabItems>
</ul>
<hr class="border-sub-border -m-[1px]" />

<style lang="postcss">
  ul {
    :global(a) {
      @apply py-2 px-4 push-effect text-sub-text;
    }
    :global(a[data-current-location]) {
      @apply border-black text-main-text border-b font-bold;
    }
  }
  :global(.dark) ul :global(a) {
    @apply border-white pop-effect;
  }
</style>

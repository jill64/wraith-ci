<script lang="ts" generics="T">
  import { InlineModal } from '@jill64/svelte-suite'
  import { PlusIcon } from '@jill64/svelte-suite/icons'
  import type { Snippet } from 'svelte'

  let {
    header,
    list,
    item,
    menu: listMenu,
    new_label
  }: {
    header: Snippet
    list: T[]
    item: Snippet<[T]>
    menu: Snippet
    new_label: string
  } = $props()
</script>

<hgroup class="flex flex-wrap items-center justify-between gap-4 py-4">
  {@render header()}
  <InlineModal>
    {#snippet button(open)}
      <button class="main btn md flex items-center gap-1" onclick={open}>
        <PlusIcon size="20" />
        {new_label}
      </button>
    {/snippet}
    {#snippet menu()}
      <div class="menu flex items-center justify-center p-6">
        {@render listMenu()}
      </div>
    {/snippet}
  </InlineModal>
</hgroup>
<ul class="flex flex-col">
  {#each list as row}
    <li
      class="flex flex-wrap gap-4 items-center first:border-none border-t border-sub-border"
    >
      {@render item(row)}
    </li>
  {:else}
    <li class="text-sub-text text-center py-4">No items found</li>
  {/each}
</ul>

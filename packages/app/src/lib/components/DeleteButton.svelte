<script lang="ts">
  import { Menu } from '@jill64/svelte-suite'
  import { TrashIcon, XIcon } from '@jill64/svelte-suite/icons'
  import { ActionButton } from '@jill64/svelte-suite/input'

  let {
    on_click
  }: {
    on_click: () => unknown
  } = $props()
</script>

<Menu Class="relative">
  {#snippet button()}
    <button class="pp rounded-full p-2 absolute top-0 right-0">
      <XIcon size="16" />
    </button>
  {/snippet}
  {#snippet contents()}
    <div class="absolute top-1 left-10">
      <ActionButton Class="delete-btn" onClick={on_click} label="Delete">
        <TrashIcon />
      </ActionButton>
    </div>
  {/snippet}
</Menu>

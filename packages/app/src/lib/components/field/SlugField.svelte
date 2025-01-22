<script lang="ts">
  import { CheckIcon, XIcon } from '@jill64/svelte-suite/icons'
  import { ActionButton } from '@jill64/svelte-suite/input'
  import SlugInput from '../UniqueInput.svelte'

  let {
    label,
    before,
    remote_validate_path,
    on_change
  }: {
    label: string
    before: string
    remote_validate_path: (value: string) => string
    on_change: (value: string) => unknown
  } = $props()

  let value = $state(before)

  $effect(() => {
    value = before
  })
</script>

<div class="flex flex-col items-start">
  <p>{label}</p>
  <div class="flex items-center gap-2">
    <SlugInput bind:value {before} {remote_validate_path}>
      {#snippet action(available)}
        <button
          class="pp rounded-full p-2 text-red-500"
          onclick={() => {
            value = before
          }}
        >
          <XIcon />
        </button>
        {#if available}
          <ActionButton
            Class="pp rounded-full p-2 text-green-500"
            onClick={() => on_change(value)}
          >
            <CheckIcon />
          </ActionButton>
        {/if}
      {/snippet}
    </SlugInput>
  </div>
</div>

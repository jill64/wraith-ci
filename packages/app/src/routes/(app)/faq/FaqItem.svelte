<script lang="ts">
  import { i } from '$lib/i18n'
  import { Menu } from '@jill64/svelte-suite'
  import { slide } from 'svelte/transition'

  let {
    question,
    answer
  }: {
    question: {
      en: string
      ja: string
    }
    answer: {
      en: string
      ja: string
    }
  } = $props()
</script>

<li>
  <Menu Class="border border-gray-500 rounded-md p-2 m-4">
    {#snippet button(state)}
      <h2 class="text-xl font-bold px-2 m-2">
        {#if state === 'CLOSED'}
          ▶︎
        {:else}
          ▼
        {/if}
        {i.translate(question)}
      </h2>
    {/snippet}
    {#snippet contents()}
      <pre transition:slide class="mx-6 mt-2">{i.translate(answer)}</pre>
    {/snippet}
  </Menu>
</li>

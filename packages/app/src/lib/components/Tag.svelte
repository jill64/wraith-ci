<script lang="ts">
  import { i } from '$lib/i18n'

  let {
    if: If,
    class: Class,
    label
  }: {
    if: boolean
    class: string
    label: {
      en: string
      ja: string
    }
  } = $props()
</script>

{#if If}
  <span
    class="inline-flex whitespace-nowrap items-center justify-center rounded-full sm font-bold text-white {Class}"
  >
    {i.translate(label)}
  </span>
{/if}

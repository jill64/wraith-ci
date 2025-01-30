<script lang="ts">
  let {
    if: If,
    class: Class,
    label
  }: {
    if: boolean
    class: string
    label: string
  } = $props()
</script>

{#if If}
  <span
    class="inline-flex whitespace-nowrap items-center justify-center rounded-full sm font-bold text-white {Class}"
  >
    {label}
  </span>
{/if}

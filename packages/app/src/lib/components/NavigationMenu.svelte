<script lang="ts">
  let {
    list
  }: {
    list: { href: string; text: string }[]
  } = $props()
</script>

<nav class="flex flex-wrap gap-2 px-4">
  {#each list as { href, text }, i}
    <a class="link hover:underline" {href}>
      {text}
    </a>
    {#if i < list.length - 1}
      <span>{'>'}</span>
    {/if}
  {/each}
</nav>

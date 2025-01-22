<script lang="ts">
  let {
    current,
    max,
    fill = false,
    Class = ''
  }: {
    Class?: string
    current: number
    max: number
    fill?: boolean
  } = $props()
</script>

<div class="{Class} relative h-4 bg-zinc-300 dark:bg-zinc-700 rounded-full">
  <div
    class="absolute top-0 left-0 h-full bg-[rebeccapurple] rounded-full"
    style:width={`calc(${current} / ${max} * 100%)`}
  ></div>
  {#if fill}
    <div
      class="absolute top-0 left-0 h-full bg-[rebeccapurple] rounded-full"
      style:width="100%"
    ></div>
  {/if}
</div>

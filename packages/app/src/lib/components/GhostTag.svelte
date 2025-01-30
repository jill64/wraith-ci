<script lang="ts">
  import { cubicInOut } from 'svelte/easing'
  import { slide } from 'svelte/transition'

  let {
    if: If,
    class: Class,
    label
  }: {
    if: boolean
    class: string
    label: string
  } = $props()

  let hover = $state(false)
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
  class="z-20 whitespace-nowrap items-center justify-center rounded-full sm transition-all font-bold text-white
    {If ? Class : 'bg-zinc-500'}"
  onmouseenter={() => {
    hover = true
  }}
  onmouseleave={() => {
    hover = false
  }}
>
  <span>{label[0]}</span>{#if hover}<span
      class="whitespace-nowrap"
      transition:slide={{ axis: 'x', easing: cubicInOut }}
      >{label.slice(1)}
    </span>
  {/if}
</span>

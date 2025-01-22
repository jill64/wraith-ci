<script lang="ts">
  import { afterNavigate, beforeNavigate } from '$app/navigation'
  import { cubicOut } from 'svelte/easing'
  import { Tween } from 'svelte/motion'

  const size = new Tween(0, {
    delay: 100,
    duration: 10000,
    easing: cubicOut
  })

  beforeNavigate(() => {
    size.set(100, {
      delay: 100,
      duration: 10000
    })
  })

  afterNavigate(() => {
    size.set(0, {
      delay: 0,
      duration: 0
    })
  })
</script>

<div class="fixed top-0 h-0.5 bg-white" style="width: {size.current}vw;"></div>

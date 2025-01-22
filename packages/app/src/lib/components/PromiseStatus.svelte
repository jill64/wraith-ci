<script lang="ts">
  import { theme } from '@jill64/svelte-suite'
  import { CheckIcon, XIcon } from '@jill64/svelte-suite/icons'
  import { Moon } from 'svelte-loading-spinners'

  let {
    status
  }: {
    status: string
  } = $props()
</script>

{#if status === 'PENDING'}
  <Moon color={theme.isDark ? 'white' : 'black'} size="20" />
{:else if status === 'FULFILLED'}
  <CheckIcon class="text-green-500" size="20" />
{:else if status === 'REJECTED'}
  <XIcon class="text-red-500" size="20" />
{/if}

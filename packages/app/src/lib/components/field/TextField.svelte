<script lang="ts">
  import { observable } from '@jill64/svelte-observer'
  import PromiseStatus from '../PromiseStatus.svelte'

  let {
    value,
    type = 'text',
    on_change
  }: {
    value: string
    type?: 'text' | 'email' | 'password'
    on_change: (value: string) => unknown
  } = $props()

  const { status, observed } = $derived(observable())
</script>

<div class="flex flex-col relative">
  <input
    {value}
    {type}
    onchange={(x) => {
      observed(on_change)(x.currentTarget.value)
    }}
    class="main-txt"
  />
  <div class="absolute top-2 right-0 gap-2">
    <PromiseStatus {status} />
  </div>
</div>

<script lang="ts">
  import { browser } from '$app/environment'
  import { FileIcon } from '@jill64/svelte-suite/icons'
  import { BarLoader } from 'svelte-loading-spinners'

  let {
    label,
    value
  }: {
    label: string
    value: Promise<string | undefined> | Blob
  } = $props()

  let preview_url = $derived(
    value instanceof Blob
      ? URL.createObjectURL(value)
      : value
          .then((x) => (browser ? fetch(`data:text/plain;base64,${x}`) : null))
          .then((x) => x?.blob())
          .then((x) => (x ? URL.createObjectURL(x) : ''))
  )
</script>

<div class="h-4 flex items-center">
  {#await preview_url}
    <BarLoader color="#AAA" />
  {:then href}
    <a {href} target="_blank" class="link flex items-center gap-1">
      <FileIcon size="16" />
      {label}
    </a>
  {/await}
</div>

<script lang="ts">
  let {
    size = '2rem',
    user
  }: {
    size?: string
    user: {
      name: string | null
      picture?: string | null
    }
  } = $props()

  let initial = $derived(user.name?.[0] || '')
</script>

{#if user.picture}
  <img
    style:width={size}
    style:height={size}
    class="object-cover rounded-full"
    src={user.picture}
    alt="profile"
  />
{:else}
  <span
    class="rounded-full flex-shrink-0 inline-flex items-center justify-center select-none border border-main-border"
    style:width={size}
    style:height={size}
    style:font-size="calc({size} / 2)"
  >
    {initial}
  </span>
{/if}

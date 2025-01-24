<script lang="ts">
  let {
    size = '2rem',
    user
  }: {
    size?: string
    user: App.Locals['github_user']
  } = $props()

  let initial = $derived(user.name?.[0] || '')
</script>

{#if user.avatar_url}
  <img
    style:width={size}
    style:height={size}
    class="object-cover rounded-full"
    src={user.avatar_url}
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

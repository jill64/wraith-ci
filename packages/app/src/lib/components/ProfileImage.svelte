<script lang="ts">
  import { PUBLIC_R2_HOST } from '$env/static/public'

  let {
    size = '2rem',
    user
  }: {
    size?: string
    user: {
      oauth_id: string | null
      name: string | null
      profile_image_key: string | null
      picture?: string | null
    }
  } = $props()

  let initial = $derived(user.name?.[0] || '')
</script>

{#if user.profile_image_key || user.picture}
  <img
    style:width={size}
    style:height={size}
    class="object-cover rounded-full"
    src={user.profile_image_key
      ? `https://${PUBLIC_R2_HOST}/${user.profile_image_key}`
      : user.picture}
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

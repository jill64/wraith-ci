<script lang="ts">
  import ProfileImage from './ProfileImage.svelte'
  let {
    user,
    show_slug = false
  }: {
    user: {
      oauth_id: string | null
      name: string | null
      profile_image_key: string | null
      picture?: string | null
      slug: string | null
    }
    picture?: string | null
    show_slug?: boolean
  } = $props()
</script>

<a
  href="/users/{user.slug}"
  class="inline-flex items-center gap-2 pp rounded-md py-1 px-2"
>
  <ProfileImage {user} />
  <div>
    <p>
      {user.name}
    </p>
    {#if show_slug}
      <p class="text-sm text-sub-text">
        {user.slug}
      </p>
    {/if}
  </div>
</a>

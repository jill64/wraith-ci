<script lang="ts">
  import { page } from '$app/stores'
  import {
    LanguageManager,
    LocaleAlternates,
    OGP,
    ThemeManager,
    Toaster,
    theme
  } from '@jill64/svelte-suite'
  import '../app.postcss'

  $: title = 'Wraith CI'
  $: description = '👻 CI suite in the dark'
  $: suffix = $theme === 'dark' ? '-dark' : ''
  $: suffix
</script>

<Toaster />
<LanguageManager />
<LocaleAlternates />
<ThemeManager />
<OGP
  {title}
  {description}
  site_name={title}
  image="{$page.url.origin}/og-image.png"
/>
<svelte:head>
  <!-- <link rel="icon" href="/favicon{suffix}.png" />
  <link rel="icon" href="/favicon{suffix}.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/apple-touch-icon{suffix}.png" /> -->
  <title>{title}</title>
  <meta name="description" content={description} />
</svelte:head>
<slot />

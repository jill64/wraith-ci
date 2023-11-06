<script lang="ts">
  import { page } from '$app/stores'
  import { ThemeManager, theme } from '@jill64/svelte-dark-theme'
  import { LanguageManager, LocaleAlternates } from '@jill64/svelte-i18n'
  import { OGP } from '@jill64/svelte-ogp'
  import { Toaster } from '@jill64/svelte-toast'
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

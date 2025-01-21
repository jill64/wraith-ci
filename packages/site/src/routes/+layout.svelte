<script lang="ts">
  import { page } from '$app/state'
  import { i } from '$lib/i18n'
  import {
    FlipButton,
    OGP,
    ThemeManager,
    Toaster,
    theme
  } from '@jill64/svelte-suite'
  import {
    LanguageManager,
    LanguageSwitcher
  } from '@jill64/svelte-suite/i18n/app'
  import logo from './logo.png'
  import '../app.postcss'

  let { children } = $props()

  let title = $derived(
    page.data.title
      ? `${i.translate(page.data.title)} | Wraith CI`
      : 'Wraith CI'
  )

  let description = $derived(
    page.data.description
      ? i.translate(page.data.description)
      : 'CI suite in the dark'
  )
</script>

<Toaster dark={theme.isDark} />
<LanguageManager />
<ThemeManager />
<OGP {title} {description} site_name={title} image="/og-image.png" />

<svelte:head>
  <link rel="icon" href="favicon.png" />
  <link rel="apple-touch-icon" href="apple-touch-icon.png" />
  <title>{title}</title>
  <meta name="description" content={description} />
</svelte:head>

<header class="flex items-center justify-between">
  <img src={logo} alt="logo" width="48px" />
  <h1 class="text-2xl font-bold bg-[#161616] text-white py-2 pr-2">
    Wraith CI
  </h1>
  <span
    class="mr-auto font-bold text-xs rounded-full bg-orange-500 px-1.5 py-0.5 text-white"
    >BETA</span
  >
  <LanguageSwitcher
    stroke={theme.isDark ? '#FFF' : '#000'}
    menuClass="absolute top-10 right-0 menu flex flex-col"
    liClass="whitespace-nowrap"
  >
    {#snippet children(label)}
      {#if label === 'en'}
        {i.translate({ en: 'English', ja: '英語' })}
      {/if}
      {#if label === 'ja'}
        {i.translate({ en: 'Japanese', ja: '日本語' })}
      {/if}
    {/snippet}
  </LanguageSwitcher>
  <FlipButton />
</header>
{@render children()}

<script lang="ts">
  import { page } from '$app/state'
  import { dict } from '$lib/dict.svelte'
  import { i } from '$lib/i18n'
  import { applyGoogleTranslate } from '$shared/applyGoogleTranslate'
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
  import { TabItems } from 'svelte-page-tab'
  import '../app.postcss'
  import logo from './logo.png'

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

  let lang = $derived(i.translate({ en: 'en', ja: 'ja' }))
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
  <a href="/" class="flex items-center mr-auto">
    <img src={logo} alt="logo" width="48px" />
    <h1 class="text-2xl font-bold bg-[#161616] text-white py-2 pr-2">
      Wraith CI
    </h1>
    <span
      class="mr-auto z-10 font-bold text-xs rounded-full bg-orange-500 px-1.5 py-0.5 text-white"
    >
      BETA
    </span>
  </a>

  <ul class="ml-auto flex items-center overflow-x-auto">
    <TabItems
      routes={new Map([
        ['/docs', dict('documentation')],
        [`/blog/${lang}`, i.translate({ en: 'Blog', ja: 'ブログ' })],
        ['/pricing', dict('pricing')],
        [
          `/contact/${lang}`,
          i.translate({ en: 'Contact us', ja: 'お問い合わせ' })
        ]
      ])}
    >
      {#snippet children(item)}
        <span class="whitespace-nowrap">
          {item}
        </span>
      {/snippet}
    </TabItems>
  </ul>
  <LanguageSwitcher
    stroke={theme.isDark ? '#FFF' : '#000'}
    menuClass="absolute top-10 right-0 menu flex flex-col z-10"
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

<footer class="sticky top-full flex justify-center items-center p-2">
  <small class="text-zinc-500 dark:text-zinc-400">
    © {new Date().getFullYear()}
    <a
      href={i.translate({
        en: applyGoogleTranslate('https://suwasystem.com', 'en'),
        ja: 'https://suwasystem.com'
      })}
      class="hover:underline"
    >
      {i.translate({ en: 'SuwaSystem', ja: '諏訪システム' })}
    </a>
    ・
    <a href="/terms/privacy" class="hover:underline">
      {i.translate({ en: 'Privacy Policy', ja: 'プライバシーポリシー' })}
    </a>
    ・
    <a href="/terms" class="hover:underline">
      {i.translate({ en: 'Terms of Service', ja: '利用規約' })}
    </a>
    ・
    <a href="/terms/commercial" class="hover:underline">
      {i.translate({
        en: 'Specific Commercial Transaction Law',
        ja: '特定商取引法に基づく表記'
      })}
    </a>
  </small>
</footer>

<style lang="postcss">
  ul :global(a) {
    @apply py-2 px-4 border-b-2 border-transparent hover:border-zinc-500;
  }
  ul :global(a[data-current-location]) {
    @apply border-black dark:border-white;
  }
</style>

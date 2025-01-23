<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation'
  import { page } from '$app/state'
  import ProfileImage from '$lib/components/ProfileImage.svelte'
  import TabMenu from '$lib/components/TabMenu.svelte'
  import { dict } from '$lib/dict.svelte'
  import { i } from '$lib/i18n'
  import { applyGoogleTranslate } from '$shared/applyGoogleTranslate'
  import {
    FlipButton,
    Menu,
    OGP,
    ThemeManager,
    Toaster,
    theme
  } from '@jill64/svelte-suite'
  import {
    LanguageManager,
    LanguageSwitcher
  } from '@jill64/svelte-suite/i18n/app'
  import { LogOutIcon, SettingsIcon } from '@jill64/svelte-suite/icons'
  import { ActionButton } from '@jill64/svelte-suite/input'
  import { slide } from 'svelte/transition'
  import '../app.postcss'
  import LoadingBar from './LoadingBar.svelte'
  import logo from './logo.png'

  let { data, children } = $props()

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

<LoadingBar />
<header class="flex items-center justify-between">
  <a href="/" class="flex items-center">
    <img src={logo} alt="logo" width="48px" />
    <h1 class="text-2xl font-bold bg-[#161616] text-white py-2 pr-2">
      Wraith CI
    </h1>
  </a>
  <span
    class="mr-auto font-bold text-xs rounded-full bg-orange-500 px-1.5 py-0.5 text-white"
  >
    BETA
  </span>
  <TabMenu
    routes={[
      ['/pricing', dict('plan')],
      ['https://wraith.dev/docs', dict('documentation')],
      ['/faq', 'FAQ'],
      [
        i.translate({
          en: applyGoogleTranslate('https://suwasystem.com/contact', 'en'),
          ja: 'https://suwasystem.com/contact'
        }),
        i.translate({ en: 'Contact us', ja: 'お問い合わせ' })
      ]
    ]}
  />
  <Menu Class="relative">
    {#snippet button()}
      <ProfileImage user={data.github_user} />
    {/snippet}
    {#snippet contents(close)}
      <div
        class="absolute right-0 top-10 p-4 menu flex-col gap-2"
        transition:slide
      >
        <a
          href="/settings"
          class="flex items-center whitespace-nowrap gap-2 pp p-2 rounded"
          onclick={close}
        >
          <SettingsIcon />
          {i.translate({ en: 'Settings', ja: '設定' })}
        </a>
        <ActionButton
          Class="flex items-center whitespace-nowrap gap-2 pp p-2 rounded"
          onClick={async () => {
            await invalidateAll()
            await goto('/api/auth/logout')
            close()
          }}
          label={i.translate({ en: 'Logout', ja: 'ログアウト' })}
        >
          <LogOutIcon />
        </ActionButton>
      </div>
    {/snippet}
  </Menu>
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

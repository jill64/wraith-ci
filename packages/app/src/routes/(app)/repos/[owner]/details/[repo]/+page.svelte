<script lang="ts">
    import { page } from '$app/state'
  import NavigationMenu from '$lib/components/NavigationMenu.svelte'
  import { dict } from '$lib/dict.svelte'
  import { i } from '$lib/i18n'

  let { data } = $props()

  let repo = $derived(data.repository)
</script>

<NavigationMenu
  list={[
    { href: '/', text: dict('top') },
    {
      href: `/repos/${page.params.owner}`,
      text: i.translate({
        en: 'Repositories',
        ja: 'リポジトリ'
      })
    }
  ]}
/>

<main class="mx-4">
  <h2 class="text-5xl font-semibold mb-2">{repo.name}</h2>
  <p>{repo.description}</p>
</main>

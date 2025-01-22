<script>
  import { page } from '$app/state'
  import { i } from '$lib/i18n'
</script>

<main class="flex flex-col gap-4 justify-center items-center">
  <h1 class="text-9xl font-thin">{page.status}</h1>
  <p class="text-xl">
    {page.error?.message ?? 'Internal Error'}
  </p>
  {#if page.error?.id}
    <p>
      {i.translate({ en: 'Error ID', ja: 'エラーID' })}: {page.error.id}
    </p>
  {/if}
  <a href="/" class="text-xl link">
    {i.translate({
      en: 'Go back to top',
      ja: 'トップに戻る'
    })}
  </a>
</main>

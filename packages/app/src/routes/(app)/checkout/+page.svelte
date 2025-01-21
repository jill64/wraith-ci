<script lang="ts">
  import { dict } from '$lib/dict.svelte'
  import { i } from '$lib/i18n'
  import { CheckCircleIcon } from '@jill64/svelte-suite/icons'

  let { data } = $props()
</script>

<main class="m-4 flex flex-col items-center justify-center gap-4">
  <h1 class="text-4xl font-bold flex gap-2 items-center">
    <CheckCircleIcon size="32" class="text-green-500" />
    {i.translate({
      en: 'Subscribed successfully',
      ja: 'サブスクライブが完了しました'
    })}
  </h1>
  <p class="text-xl">{dict('plan')} : {data.selected_plan}</p>
  <a href="/" class="link text-2xl">
    {i.translate({ en: 'Goto top page', ja: 'トップページへ' })}
  </a>
</main>

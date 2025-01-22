<script lang="ts">
  import { i } from '$lib/i18n'
  import { en, ja } from '$shared/terms/terms'
</script>

<main class="p-4">
  <h1 class="text-3xl font-bold">
    {i.translate({
      en: 'Terms of Service',
      ja: 'WraithCI 利用規約'
    })}
  </h1>
  <p class="flex justify-end">
    {i.translate({
      en: 'Last updated: January 14, 2025',
      ja: '最終更新日：2025年1月14日'
    })}
  </p>
  <div class="whitespace-pre">
    {i.translate({ ja, en })}
  </div>
</main>

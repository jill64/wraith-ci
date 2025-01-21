<script lang="ts">
  import { i } from '$lib/i18n'
  import { en, ja } from '$shared/terms/privacy'
</script>

<main class="p-4">
  <h1 class="text-3xl font-bold">
    {i.translate({ ja: 'プライバシーポリシー', en: 'Privacy Policy' })}
  </h1>
  <p class="flex justify-end">
    {i.translate({
      ja: '最終更新日：2025年1月14日',
      en: 'Last updated: 2025/1/14'
    })}
  </p>
  <div class="whitespace-pre">
    {i.translate({ ja, en })}
  </div>
</main>

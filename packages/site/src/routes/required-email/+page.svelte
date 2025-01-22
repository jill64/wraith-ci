<script lang="ts">
  import { i } from '$lib/i18n'

  let { data } = $props()
</script>

<main class="m-4">
  <h1 class="text-4xl font-bold my-2">{i.translate(data.title)}</h1>
  <p>
    {#if i.locale === 'ja'}
      続行するには<a href="https://github.com" class="link">GitHub</a>
      でアカウントにメールアドレスを設定して下さい。
    {:else}
      Please set your email address in your
      <a href="https://github.com" class="link"> GitHub </a> account to continue.
    {/if}
  </p>
  <a href="https://app.wraithci.dev" class="link text-2xl font-bold">
    {i.translate({
      en: 'Back to login screen',
      ja: 'ログイン画面に戻る'
    })}
  </a>
</main>

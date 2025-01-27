<script lang="ts">
  import { i } from '$lib/i18n'
  import { request } from '$lib/request.svelte'
  import { ActionButton } from '@jill64/svelte-suite/input'

  let npm_token = $state('')
</script>

<main class="mx-4">
  <h2 class="text-3xl font-bold">
    {i.translate({ en: 'Settings', ja: '設定' })}
  </h2>
  <div class="inline-grid cols-auto-1 sm:cols-auto-2 gap-4 items-center">
    <h3>npm token</h3>
    <span>
      <input class="txt w-52 md:w-96" type="password" bind:value={npm_token} />
      <ActionButton
        onClick={async () => {
          await request.put('npm-token', {
            body: npm_token,
            invalidate: () => true
          })
          npm_token = ''
        }}
        Class="btn main md font-bold"
        label={i.translate({
          en: 'Save',
          ja: '保存'
        })}
        disabled={!npm_token}
      />
    </span>
  </div>
</main>

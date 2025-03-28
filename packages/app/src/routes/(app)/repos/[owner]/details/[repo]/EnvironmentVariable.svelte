<script lang="ts">
  import { i } from '$lib/i18n'
  import { request } from '$lib/request.svelte.js'
  import { SlidersIcon, Trash2Icon } from '@jill64/svelte-suite/icons'
  import { ActionButton } from '@jill64/svelte-suite/input'

  let { envs: data_envs }: { envs: Record<string, string> } = $props()

  let key = $state('')
  let value = $state('')

  let envs = $state(Object.entries(data_envs))
  let envs_sending = $state(false)

  let key_dom: HTMLInputElement | undefined

  let duplicatedKeys = $derived.by(() => {
    const keys = envs.map((x) => x[0])
    const set = [...new Set(keys)]

    return new Set(set.filter((x) => keys.filter((k) => k === x).length !== 1))
  })
</script>

<article>
  <hgroup class="flex items-center gap-2">
    <SlidersIcon />
    <h3 class="text-3xl font-bold my-4">
      {i.translate({ en: 'Environment Variable', ja: '環境変数' })}
    </h3>
  </hgroup>
  <p>
    {i.translate({
      en: 'All environment variables are saved encrypted by default.',
      ja: 'すべての環境変数はデフォルトで暗号化して保存されます。'
    })}
  </p>
  <table>
    <thead>
      <tr>
        <th>{i.translate({ en: 'Key', ja: 'キー' })}</th>
        <th></th>
        <th>{i.translate({ en: 'Value', ja: '値' })}</th>
      </tr>
    </thead>
    <tbody>
      {#each envs as [key, value], index}
        <tr>
          <td>
            <input
              type="text"
              value={key}
              class="{duplicatedKeys.has(key)
                ? 'border-red-500'
                : 'border-zinc-500'} disabled:text-zinc-600 disabled:bg-zinc-300 disabled:dark:text-gray-500 disabled:dark:bg-gray-900"
              oninput={(e) => {
                envs[index][0] = e.currentTarget.value
              }}
              disabled={envs_sending}
            />
          </td>
          <td>=</td>
          <td>
            <input
              type="text"
              {value}
              class="border-zinc-500 disabled:text-zinc-600 disabled:bg-zinc-300 disabled:dark:text-gray-500 disabled:dark:bg-gray-900"
              oninput={(e) => {
                envs[index][1] = e.currentTarget.value
              }}
              disabled={envs_sending}
            />
          </td>
          <td>
            <button
              class="pp p-2 rounded-full hover:text-red-500"
              onclick={() => {
                envs.splice(index, 1)
              }}
              disabled={envs_sending}
            >
              <Trash2Icon />
            </button>
          </td>
        </tr>
      {/each}
      <tr>
        <td>
          <input
            type="text"
            bind:this={key_dom}
            bind:value={key}
            class="border-zinc-500 disabled:text-zinc-600 disabled:bg-zinc-300 disabled:dark:text-gray-500 disabled:dark:bg-gray-900"
            onkeypress={(e) => {
              if (e.key === 'Enter') {
                envs[envs.length] = [key, value]
                key = ''
                value = ''
              }
            }}
            disabled={envs_sending}
          />
        </td>
        <td>=</td>
        <td>
          <input
            type="text"
            bind:value
            class="border-zinc-500 disabled:text-zinc-600 disabled:bg-zinc-300 disabled:dark:text-gray-500 disabled:dark:bg-gray-900"
            onkeypress={(e) => {
              if (e.key === 'Enter' && key) {
                envs[envs.length] = [key, value]
                key = ''
                value = ''
                key_dom?.focus()
              }
            }}
            disabled={envs_sending}
          />
        </td>
        <td>
          {#if key}
            <ActionButton
              Class="pp p-2 rounded-full"
              onClick={() => {
                envs[envs.length] = [key, value]
                key = ''
                value = ''
                key_dom?.focus()
              }}
              disabled={envs_sending}
            >
              ＋
            </ActionButton>
          {/if}
        </td>
      </tr>
    </tbody>
  </table>
  <ActionButton
    Class="btn main md mt-4"
    onClick={async () => {
      envs_sending = true

      await request.put('envs', {
        invalidate: () => true,
        body: JSON.stringify(Object.fromEntries(envs))
      })

      envs_sending = false
    }}
    label={i.translate({
      en: 'Save',
      ja: '保存'
    })}
    disabled={duplicatedKeys.size !== 0 || envs_sending}
  />
</article>

<style lang="postcss">
  input {
    @apply bg-inherit border rounded py-1 px-2;
  }
  th,
  td {
    @apply p-2;
  }
</style>

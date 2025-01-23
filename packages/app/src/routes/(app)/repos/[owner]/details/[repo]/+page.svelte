<script lang="ts">
  import { page } from '$app/state'
  import NavigationMenu from '$lib/components/NavigationMenu.svelte'
  import { dict } from '$lib/dict.svelte'
  import { i } from '$lib/i18n'
  import { request } from '$lib/request.svelte.js'
  import { Trash2Icon } from '@jill64/svelte-suite/icons'
  import { ActionButton } from '@jill64/svelte-suite/input'

  let { data } = $props()

  let repo = $derived(data.repository)

  let key = $state('')
  let value = $state('')

  let data_envs = $derived(Object.entries(data.envs))

  let envs = $state(data_envs)

  let key_dom: HTMLInputElement | undefined

  let duplicatedKeys = $derived.by(() => {
    const keys = envs.map((x) => x[0])
    const set = [...new Set(keys)]

    return new Set(set.filter((x) => keys.filter((k) => k === x).length !== 1))
  })
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
  <h2 class="text-5xl font-semibold mt-1 mb-4">{repo.name}</h2>
  <p>{repo.description}</p>
  <h3 class="text-3xl font-bold mt-4">
    {i.translate({ en: 'Environment Variable', ja: '環境変数' })}
  </h3>
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
              class={duplicatedKeys.has(key)
                ? 'border-red-500'
                : 'border-zinc-500'}
              oninput={(e) => {
                envs[index][0] = e.currentTarget.value
              }}
            />
          </td>
          <td>=</td>
          <td>
            <input
              type="text"
              {value}
              class="border-zinc-500"
              oninput={(e) => {
                envs[index][1] = e.currentTarget.value
              }}
            />
          </td>
          <td>
            <button
              class="pp p-2 rounded-full hover:text-red-500"
              onclick={() => {
                envs.splice(index, 1)
              }}
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
            class="border-zinc-500"
            onkeypress={(e) => {
              if (e.key === 'Enter') {
                envs[envs.length] = [key, value]
                key = ''
                value = ''
              }
            }}
          />
        </td>
        <td>=</td>
        <td>
          <input
            type="text"
            bind:value
            class="border-zinc-500"
            onkeypress={(e) => {
              if (e.key === 'Enter' && key) {
                envs[envs.length] = [key, value]
                key = ''
                value = ''
                key_dom?.focus()
              }
            }}
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
    onClick={() =>
      request.put('envs', {
        invalidate: () => true,
        body: JSON.stringify(Object.fromEntries(envs))
      })}
    label={i.translate({
      en: 'Save',
      ja: '保存'
    })}
    disabled={duplicatedKeys.size !== 0}
  />
</main>

<style lang="postcss">
  input {
    @apply bg-inherit border rounded py-1 px-2;
  }
  th,
  td {
    @apply p-2;
  }
</style>

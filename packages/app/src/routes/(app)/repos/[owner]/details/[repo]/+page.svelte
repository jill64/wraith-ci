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

  let envs = $state(data.envs)

  let key_dom: HTMLInputElement | undefined

  $effect(() => {
    if (JSON.stringify(envs) !== JSON.stringify(data.envs)) {
      const text = JSON.stringify(envs)
      request.put('envs', {
        invalidate: () => false,
        body: text
      })
    }
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
  <h2 class="text-5xl font-semibold mb-2">{repo.name}</h2>
  <p>{repo.description}</p>
  <h3 class="text-3xl font-bold mt-4">
    {i.translate({ en: 'Environment Variable', ja: '環境変数' })}
  </h3>
  <table>
    <thead>
      <tr>
        <th>{i.translate({ en: 'Key', ja: 'キー' })}</th>
        <th></th>
        <th>{i.translate({ en: 'Value', ja: '値' })}</th>
      </tr>
    </thead>
    <tbody>
      {#each Object.entries(envs) as [key, value]}
        <tr>
          <td>{key}</td>
          <td>=</td>
          <td>
            <input
              type="text"
              {value}
              onchange={(e) => {
                envs[key] = e.currentTarget.value
              }}
            />
          </td>
          <td>
            <button
              class="pp p-2 rounded-full hover:text-red-500"
              onclick={() => {
                delete envs[key]
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
            onkeypress={(e) => {
              if (e.key === 'Enter') {
                envs[key] = value
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
            onkeypress={(e) => {
              if (e.key === 'Enter' && key) {
                envs[key] = value
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
                envs[key] = value
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
</main>

<style lang="postcss">
  input {
    @apply bg-inherit border border-zinc-500 rounded py-1 px-2;
  }
  th,
  td {
    @apply p-2;
  }
</style>

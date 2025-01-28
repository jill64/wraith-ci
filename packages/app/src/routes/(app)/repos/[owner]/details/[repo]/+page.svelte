<script lang="ts">
  import { page } from '$app/state'
  import NavigationMenu from '$lib/components/NavigationMenu.svelte'
  import { dict } from '$lib/dict.svelte'
  import { i } from '$lib/i18n'
  import { request } from '$lib/request.svelte.js'
  import { schema } from '$shared/ghost/schema'
  import { toast } from '@jill64/svelte-suite'
  import { Trash2Icon } from '@jill64/svelte-suite/icons'
  import { ActionButton, CheckBox } from '@jill64/svelte-suite/input'

  let { data } = $props()

  let repo = $derived(data.repository)

  let key = $state('')
  let value = $state('')

  let envs = $state(Object.entries(data.envs))
  let envs_sending = $state(false)

  let key_dom: HTMLInputElement | undefined

  let duplicatedKeys = $derived.by(() => {
    const keys = envs.map((x) => x[0])
    const set = [...new Set(keys)]

    return new Set(set.filter((x) => keys.filter((k) => k === x).length !== 1))
  })

  const capitalizeFirstLetter = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1)

  let ghostBumpConfig = $state(data.ghost_bump_configs)
  let bump_config_sending = $state(false)
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
  <div class="flex flex-wrap gap-10">
    <div>
      <h3 class="text-3xl font-bold my-4">
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
    </div>
    <div>
      <h2 class="text-3xl font-bold my-4">Ghost Setting</h2>
      <div class="flex flex-col gap-2">
        {#each Object.keys(schema) as ghost}
          <CheckBox
            value={!data.ignore_ghosts.includes(ghost)}
            onChange={(v) =>
              toast.promise(
                request.put('ignore-ghosts', {
                  invalidate: () => true,
                  body: JSON.stringify([
                    ...data.ignore_ghosts.filter((x) => x !== ghost),
                    ...(v ? [] : [ghost])
                  ])
                }),
                {
                  loading: i.translate({
                    en: 'Saving...',
                    ja: '保存中...'
                  }),
                  success: i.translate({
                    en: 'Saved',
                    ja: '保存しました'
                  }),
                  error: i.translate({
                    en: 'Failed to save',
                    ja: '保存に失敗しました'
                  })
                }
              )}
          >
            <span class="ml-2">Ghost {capitalizeFirstLetter(ghost)}</span>
          </CheckBox>
        {/each}
      </div>
    </div>
    <div>
      <h3 class="text-3xl font-bold my-4">Ghost Bump Config</h3>
      <div>
        <div class="inline-grid cols-auto-2 items-center gap-2">
          <div>Major</div>
          <input
            class="txt disabled:text-zinc-600 disabled:bg-zinc-300 disabled:dark:text-gray-500 disabled:dark:bg-gray-900"
            placeholder="major,breaking"
            bind:value={ghostBumpConfig.major}
            disabled={bump_config_sending}
          />
          <div>Minor</div>
          <input
            class="txt disabled:text-zinc-600 disabled:bg-zinc-300 disabled:dark:text-gray-500 disabled:dark:bg-gray-900"
            placeholder="minor,feat"
            bind:value={ghostBumpConfig.minor}
            disabled={bump_config_sending}
          />
          <div>Patch</div>
          <input
            class="txt disabled:text-zinc-600 disabled:bg-zinc-300 disabled:dark:text-gray-500 disabled:dark:bg-gray-900"
            placeholder="*"
            bind:value={ghostBumpConfig.patch}
            disabled={bump_config_sending}
          />
          <div>Skip</div>
          <input
            class="txt disabled:text-zinc-600 disabled:bg-zinc-300 disabled:dark:text-gray-500 disabled:dark:bg-gray-900"
            placeholder="chore"
            bind:value={ghostBumpConfig.skip}
            disabled={bump_config_sending}
          />
          <div>Cumulative Update</div>
          <input
            type="number"
            class="txt disabled:text-zinc-600 disabled:bg-zinc-300 disabled:dark:text-gray-500 disabled:dark:bg-gray-900"
            placeholder="50"
            bind:value={ghostBumpConfig.cumulative_update}
            disabled={bump_config_sending}
          />
        </div>
      </div>
      <ActionButton
        Class="btn main md mt-4"
        onClick={async () => {
          bump_config_sending = true

          await request.put('ghost/bump-config', {
            invalidate: () => true,
            body: JSON.stringify(ghostBumpConfig)
          })

          bump_config_sending = false
        }}
        label={i.translate({
          en: 'Save',
          ja: '保存'
        })}
        disabled={duplicatedKeys.size !== 0 || bump_config_sending}
      />
    </div>
  </div>
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

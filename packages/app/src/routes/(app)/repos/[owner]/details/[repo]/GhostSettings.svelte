<script lang="ts">
  import { i } from '$lib/i18n'
  import { request } from '$lib/request.svelte.js'
  import { schema } from '$shared/ghost/schema'
  import { toast } from '@jill64/svelte-suite'
  import { SettingsIcon } from '@jill64/svelte-suite/icons'
  import { CheckBox } from '@jill64/svelte-suite/input'

  let { ignore_ghosts }: { ignore_ghosts: string[] } = $props()

  const capitalizeFirstLetter = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1)

  let ignores = $state(ignore_ghosts)
</script>

<article>
  <hgroup class="flex items-center gap-2">
    <SettingsIcon />
    <h3 class="text-3xl font-bold my-4">Ghost Setting</h3>
  </hgroup>
  <div class="flex flex-col gap-2">
    {#each Object.keys(schema) as ghost}
      <CheckBox
        value={!ignores.includes(ghost)}
        onChange={async (v) => {
          const new_json = [
            ...ignores.filter((x) => x !== ghost),
            ...(v ? [] : [ghost])
          ]

          ignores = new_json

          await toast.promise(
            request.put('ignore-ghosts', {
              invalidate: () => true,
              body: JSON.stringify(new_json)
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
          )
        }}
      >
        <span class="ml-2">Ghost {capitalizeFirstLetter(ghost)}</span>
      </CheckBox>
    {/each}
  </div>
</article>

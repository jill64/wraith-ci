<script lang="ts">
  import { i } from '$lib/i18n'
  import { request } from '$lib/request.svelte.js'
  import { toast } from '@jill64/svelte-suite'
  import { AlignLeftIcon } from '@jill64/svelte-suite/icons'
  import { CheckBox } from '@jill64/svelte-suite/input'

  let { ghost_docs_ignore_files }: { ghost_docs_ignore_files: string[] } =
    $props()

  let ignore_files = $state(ghost_docs_ignore_files)
</script>

<article>
  <hgroup class="flex items-center gap-2">
    <AlignLeftIcon />
    <h3 class="text-3xl font-bold my-4">Ghost Docs</h3>
  </hgroup>
  <div class="flex flex-col gap-2">
    {#each ['README.md', 'package.json'] as file}
      <CheckBox
        value={!ignore_files.includes(file)}
        onChange={async (v) => {
          const new_json = [
            ...ignore_files.filter((x) => x !== file),
            ...(v ? [] : [file])
          ]

          ignore_files = new_json

          await toast.promise(
            request.put('ghost/docs', {
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
        <span class="ml-2">{file}</span>
      </CheckBox>
    {/each}
  </div>
</article>

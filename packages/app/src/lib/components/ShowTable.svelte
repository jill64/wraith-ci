<script lang="ts">
  import type { Column } from '$lib/types/star-system/Column'
  import type { ColumnDiff } from '$lib/types/star-system/ColumnDiff'
  import type { IndexDiff } from '$lib/types/star-system/IndexDiff'
  import type { IndexKey } from '$lib/types/star-system/IndexKey'
  import type { Table } from '$lib/types/star-system/Table'
  import { EditIcon, MinusIcon, PlusIcon } from '@jill64/svelte-suite/icons'

  let {
    schema,
    mode = undefined
  }:
    | {
        schema: {
          table: Table
          columns: Column[]
          indexes: IndexKey[]
        }
        mode?: 'ADD' | 'DROP'
      }
    | {
        schema: {
          table: Table
          columns: ColumnDiff
          indexes: IndexDiff
        }
        mode?: 'MODIFY'
      } = $props()

  const add_color = '#484'
  const modify_color = '#884'
  const drop_color = '#844'

  let outside = $derived(
    mode === 'ADD'
      ? add_color
      : mode === 'MODIFY'
        ? modify_color
        : mode === 'DROP'
          ? drop_color
          : 'var(--main-border)'
  )
</script>

<div
  class="flex flex-col gap-4 rounded-lg p-4 overflow-x-auto"
  style:--outside-color={outside}
  style:border="solid 2px var(--outside-color)"
>
  <hgroup class="flex flex-wrap items-center justify-between">
    <h3 class="text-2xl font-bold">
      {schema.table.name}
    </h3>
    {#if mode === 'ADD'}
      <PlusIcon class="stroke-[var(--outside-color)]" strokeWidth={3} />
    {:else if mode === 'DROP'}
      <MinusIcon class="stroke-[var(--outside-color)]" strokeWidth={3} />
    {:else if mode === 'MODIFY'}
      <EditIcon class="stroke-[var(--outside-color)]" />
    {/if}
  </hgroup>
  <table>
    {#if Array.isArray(schema.columns) ? schema.columns.length : schema.columns.addColumns.length || schema.columns.dropColumns.length}
      <thead>
        <tr>
          <th> Cid </th>
          <th> Name </th>
          <th> Type </th>
          <th> Not Null </th>
          <th> Default Value </th>
          <th> Primary Key </th>
        </tr>
      </thead>
    {/if}
    <tbody>
      {#snippet row({
        column,
        theme
      }: {
        column: Column
        theme?: 'ADD' | 'DROP'
      })}
        <tr
          class={theme === 'ADD'
            ? 'border-2 border-[#484]'
            : theme === 'DROP'
              ? 'border-2 border-[#844]'
              : ''}
        >
          <td class="{theme ? 'border-r' : 'border'} border-main-border">
            {column.cid}
          </td>
          <td
            class="{theme ? 'border-l border-r' : 'border'} border-main-border"
          >
            {column.name}
          </td>
          <td
            class="{theme ? 'border-l border-r' : 'border'} border-main-border"
          >
            {column.type}
          </td>
          <td
            class="{theme ? 'border-l border-r' : 'border'} border-main-border"
          >
            {column.notnull}
          </td>
          <td
            class="{theme ? 'border-l border-r' : 'border'} border-main-border"
          >
            {column.dflt_value}
          </td>
          <td class="{theme ? 'border-l' : 'border'} border-main-border">
            {column.pk}
          </td>
        </tr>
      {/snippet}
      {#if Array.isArray(schema.columns)}
        {#each schema.columns as column}
          {@render row({ column })}
        {/each}
      {:else}
        {#each schema.columns.addColumns as column}
          {@render row({ column, theme: 'ADD' })}
        {/each}
        {#each schema.columns.dropColumns as column}
          {@render row({ column, theme: 'DROP' })}
        {/each}
      {/if}
    </tbody>
  </table>
  <table>
    {#if Array.isArray(schema.indexes) ? schema.indexes.length : schema.indexes.addIndexes.length || schema.indexes.dropIndexes.length}
      <thead>
        <tr>
          <th> Seq </th>
          <th> Name </th>
          <th> Unique </th>
          <th> Origin </th>
          <th> Partial </th>
          <th> Columns </th>
        </tr>
      </thead>
    {/if}
    <tbody>
      {#snippet idx({
        index,
        theme
      }: {
        index: IndexKey
        theme?: 'ADD' | 'DROP'
      })}
        <tr
          class={theme === 'ADD'
            ? 'border-2 border-[#484]'
            : theme === 'DROP'
              ? 'border-2 border-[#844]'
              : ''}
        >
          <td class="{theme ? 'border-r' : 'border'} border-main-border">
            {index.seq}
          </td>
          <td
            class="{theme ? 'border-l border-r' : 'border'} border-main-border"
          >
            {index.name}
          </td>
          <td
            class="{theme ? 'border-l border-r' : 'border'} border-main-border"
          >
            {index.unique}
          </td>
          <td
            class="{theme ? 'border-l border-r' : 'border'} border-main-border"
          >
            {index.origin}
          </td>
          <td
            class="{theme ? 'border-l border-r' : 'border'} border-main-border"
          >
            {index.partial}
          </td>
          <td
            class="{theme
              ? 'border-l'
              : 'border'} border-main-border whitespace-pre"
          >
            {JSON.stringify(index.columns, null, 2)}
          </td>
        </tr>
      {/snippet}
      {#if Array.isArray(schema.indexes)}
        {#each schema.indexes as index}
          {@render idx({ index })}
        {/each}
      {:else}
        {#each schema.indexes.addIndexes as index}
          {@render idx({ index, theme: 'ADD' })}
        {/each}
        {#each schema.indexes.dropIndexes as index}
          {@render idx({ index, theme: 'DROP' })}
        {/each}
      {/if}
    </tbody>
  </table>
</div>

<style>
  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    border-left: 1px solid var(--main-border);
    border-top: 1px solid var(--main-border);
    border-right: 1px solid var(--main-border);
    padding: 0.5rem;
  }
  td {
    padding: 0.5rem;
  }
</style>

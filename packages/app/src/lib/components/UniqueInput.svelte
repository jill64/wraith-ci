<script lang="ts">
  import { browser } from '$app/environment'
  import { theme } from '@jill64/svelte-suite'
  import type { Snippet } from 'svelte'
  import { is } from 'svelte-hydrated'
  import { Moon } from 'svelte-loading-spinners'
  import { match } from '../../params/slug'

  let {
    value = $bindable(),
    placeholder,
    before = '',
    remote_validate_path,
    action,
    Class = '',
    type = 'text',
    local_validator = match,
    onload_focus,
    disabled = false,
    onenter
  }: {
    value: string
    type?: 'text' | 'email'
    before?: string
    placeholder?: string
    disabled?: boolean
    remote_validate_path: (value: string) => string
    action: Snippet<[boolean | Promise<boolean>]>
    Class?: string
    local_validator?: (value: string) => unknown
    onload_focus?: boolean
    onenter?: () => unknown
  } = $props()

  let dom: HTMLInputElement | undefined

  let invalid_char = $derived(!local_validator(value))
  let too_long = $derived(value.length >= 255)
  let valid = $derived(!invalid_char && !too_long)
  let available = $derived(
    valid && browser
      ? fetch(remote_validate_path(value))
          .then((res) => res.text())
          .then((res) => res === 'OK')
      : false
  )

  $effect(() => {
    if (onload_focus) {
      dom?.focus()
    }
  })

  $inspect({ value, before, valid, available })
</script>

<div class="flex flex-col items-center gap-4">
  <div class="relative">
    <input
      {type}
      {disabled}
      onkeydown={async (e) => {
        if (e.key === 'Enter' && (await available)) {
          onenter?.()
        }
      }}
      class="main-txt {Class}"
      bind:this={dom}
      {placeholder}
      bind:value
    />
    <span class="size-6 absolute top-1.5 right-0">
      {#if before !== value}
        <div class="flex items-center justify-center size-6">
          {#if value && is.hydrated}
            {#await available}
              <Moon color={theme.isDark ? 'white' : 'black'} size="20" />
            {/await}
          {/if}
        </div>
      {/if}
    </span>
    {#if before !== value}
      {#if !valid}
        {#if invalid_char}
          <p class="text-red-500">Does not meet input rules</p>
        {/if}
        {#if too_long}
          <p class="text-red-500">Too many characters</p>
        {/if}
      {:else}
        {#await available then available}
          {#if !available}
            <p class="text-yellow-500">{value} is already in use</p>
          {/if}
        {/await}
      {/if}
    {/if}
  </div>
</div>

{#await available}
  {@render action(false)}
{:then available}
  {@render action(available)}
{/await}

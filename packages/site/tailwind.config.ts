import { tailwindConfig } from '@jill64/svelte-tailwind'

/** @type {import('@jill64/svelte-tailwind').TailwindConfig} */
export default tailwindConfig({
  theme: {
    extend: {
      colors: {
        'main-bg': 'var(--main-bg)',
        'sub-bg': 'var(--sub-bg)',
        'glass-bg': 'var(--glass-bg)',
        'main-text': 'var(--main-text)',
        'sub-text': 'var(--sub-text)',
        'main-border': 'var(--main-border)',
        'sub-border': 'var(--sub-border)'
      },
      screens: {
        xs: '375px'
      }
    }
  }
})

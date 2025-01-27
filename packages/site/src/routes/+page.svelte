<script>
  import { i } from '$lib/i18n'
  import CenterCircle from './CenterCircle.svelte'
</script>

<main>
  <div class="grid grid-cols-2 items-center mx-2">
    <span>
      <h1 class="text-5xl md:text-9xl font-bold">Just Install</h1>
      <h1 class="text-5xl md:text-9xl font-bold">Ready To Go</h1>
    </span>
    <span>
      <a
        href="https://warithci.dev"
        class="whitespace-nowrap border border-black dark:border-transparent push-effect bg-white rounded-full font-bold text-black text-xl md:text-5xl md md:py-4 md:px-8"
      >
        {i.translate({ en: 'Get Started', ja: '使用を開始する' })}
      </a>
    </span>
  </div>
  <h2 class="mx-4 my-6 font-bold text-xl md:text-4xl flex justify-center">
    Zero Config CI for Node.js Application
  </h2>
  <CenterCircle />
  <p class="flex justify-center">
    {i.translate({
      en: 'Various ghosts will help your application from the darkness.',
      ja: '様々なゴースト達があなたのアプリケーションを暗闇の中から支援します。'
    })}
  </p>
</main>

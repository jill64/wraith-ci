<script lang="ts">
  import { browser } from '$app/environment'
  import { i } from '$lib/i18n'
  import { slide } from 'svelte/transition'

  let circle: HTMLDivElement | undefined
  let angle = $state(0)
  let relativeAngle = $derived(angle % 360)
  let timerId: NodeJS.Timer | undefined

  const setIntervalRotate = () =>
    setInterval(() => {
      angle += 45
      rotate(angle)
    }, 5000)

  timerId = browser ? setIntervalRotate() : undefined

  const rotate = (angle: number) => {
    if (circle && clearInterval) {
      circle.style.transform = `rotate(${angle}deg)`
      clearInterval(timerId)
      timerId = setIntervalRotate()
    }
  }

  let isBuild = $derived(relativeAngle === 0)
  let isRelease = $derived(relativeAngle === 315)
  let isBump = $derived(relativeAngle === 270)
  let isMerge = $derived(relativeAngle === 225)
  let isDocs = $derived(relativeAngle === 180)
  let isFormat = $derived(relativeAngle === 135)
  let isTest = $derived(relativeAngle === 90)
  let isLint = $derived(relativeAngle === 45)
</script>

<div class="flex flex-wrap justify-center items-center gap-24 my-28">
  <div class="circle-container">
    <h2 class="absolute top-[130px] left-[110px] text-4xl font-bold z-10">
      Ghost
    </h2>
    <div class="circle-rotate" bind:this={circle}>
      <h2 class="item {isBuild ? 'text-4xl z-10' : ''}">
        <button
          onclick={() => {
            angle = 0
            rotate(angle)
          }}
        >
          Build
        </button>
      </h2>
      <h2 class="item {isRelease ? 'text-4xl z-10' : 'text-gray-500'}">
        <button
          onclick={() => {
            angle = 315
            rotate(angle)
          }}
        >
          Release
        </button>
      </h2>
      <h2 class="item {isBump ? 'text-4xl z-10' : 'text-gray-500'}">
        <button
          onclick={() => {
            angle = 270
            rotate(angle)
          }}
        >
          Bump
        </button>
      </h2>
      <h2 class="item {isMerge ? 'text-4xl z-10' : 'text-gray-500'}">
        <button
          onclick={() => {
            angle = 225
            rotate(angle)
          }}
        >
          Merge
        </button>
      </h2>
      <h2 class="item {isDocs ? 'text-4xl z-10' : 'text-gray-500'}">
        <button
          onclick={() => {
            angle = 180
            rotate(angle)
          }}
        >
          Docs
        </button>
      </h2>
      <h2 class="item {isFormat ? 'text-4xl z-10' : 'text-gray-500'}">
        <button
          onclick={() => {
            angle = 135
            rotate(angle)
          }}
        >
          Format
        </button>
      </h2>
      <h2 class="item {isTest ? 'text-4xl z-10' : 'text-gray-500'}">
        <button
          onclick={() => {
            angle = 90
            rotate(angle)
          }}
        >
          Test
        </button>
      </h2>
      <h2 class="item {isLint ? 'text-4xl z-10' : 'text-gray-500'}">
        <button
          onclick={() => {
            angle = 45
            rotate(angle)
          }}
        >
          Lint
        </button>
      </h2>
    </div>
  </div>
  <div class="w-80">
    {#if isBuild}
      <p class="description" transition:slide>
        {i.translate({
          en: 'Check if the build is done correctly and if the artifact is not updated, automatically commit it.',
          ja: '正しくビルドが行われるかチェックし、アーティファクトが更新されていなければ、自動的にコミットします。'
        })}
      </p>
    {:else if isRelease}
      <p class="description" transition:slide>
        {i.translate({
          en: 'Automatically execute tagging, creating release notes, and publishing to npm library when pushing to the default branch.',
          ja: 'デフォルトブランチへのプッシュ時に、タグ打ち・リリースノートの作成・npmライブラリへの公開を自動的に実行します。'
        })}
      </p>
    {:else if isBump}
      <p class="description" transition:slide>
        {i.translate({
          en: 'Automatically update the version in package.json based on the predefined PR title prefix rules.',
          ja: 'あらかじめ決められたPRタイトルプレフィックスルールに基づいて、package.jsonのバージョンを自動で更新します。'
        })}
      </p>
    {:else if isMerge}
      <p class="description" transition:slide>
        {i.translate({
          en: 'Automatically merge PRs from predefined users.',
          ja: 'あらかじめ決められたユーザーからのPRを自動でマージします。'
        })}
      </p>
    {:else if isDocs}
      <p class="description" transition:slide>
        {i.translate({
          en: 'Automatically update documents such as README.md and package.json to keep them up to date.',
          ja: 'README.mdやpackage.jsonといったドキュメントを自動更新し、最新の状態に保ちます。'
        })}
      </p>
    {:else if isFormat}
      <p class="description" transition:slide>
        {i.translate({
          en: 'Execute formatting and automatically commit the diff.',
          ja: 'フォーマットを実行し、差分を自動でコミットします。'
        })}
      </p>
    {:else if isTest}
      <p class="description" transition:slide>
        {i.translate({
          en: 'Automatically check if the test passes successfully.',
          ja: 'テストが正常に通るか自動でチェックします。'
        })}
      </p>
    {:else if isLint}
      <p class="description" transition:slide>
        {i.translate({
          en: 'Automatically check if Lint passes successfully.',
          ja: 'Lintが正常に通るか自動でチェックします。'
        })}
      </p>
    {/if}
    <a
      href="/docs/ghost/{isBuild
        ? 'build'
        : isLint
          ? 'lint'
          : isTest
            ? 'test'
            : isFormat
              ? 'format'
              : isDocs
                ? 'docs'
                : isMerge
                  ? 'merge'
                  : isBump
                    ? 'bump'
                    : 'release'}"
      class="link"
    >
      Read more
    </a>
  </div>
</div>

<style lang="postcss">
  .description {
    font-size: 1.5rem;
    @apply font-bold;
  }

  /* 親コンテナ */
  .circle-container {
    @apply relative w-[300px] h-[300px] rounded-full;
  }

  /* 回転する要素（中に8要素を格納） */
  .circle-rotate {
    transform: rotate(0deg);
    transition: transform 0.5s; /* 回転を滑らかにする */
    @apply w-full h-full relative;
  }

  /* 各要素の見た目 */
  .item {
    margin: -15px 0 0 -15px; /* 中心基準にするため */
    text-align: center;
    line-height: 30px;
    transition: all 0.3s;
    @apply absolute top-1/2 left-1/2 w-[30px] h-[30px] rounded-full text-white font-bold;
  }

  .item::before {
    content: '';
    filter: blur(8px); /* ここでぼかし */
    @apply absolute -top-[30px] -left-[20px] -right-[120px] -bottom-[30px] rounded-full -z-10;
  }

  /* Build */
  .item:nth-child(1) {
    transform: rotate(0deg) translate(100px);
  }
  .item:nth-child(1)::before {
    background: rgb(49, 94, 230); /* 同じ背景色 */
  }
  :global(.dark) .item:nth-child(1)::before {
    background: rgb(34, 54, 115); /* 同じ背景色 */
  }

  /* Release */
  .item:nth-child(2) {
    transform: rotate(45deg) translate(100px);
  }
  .item:nth-child(2)::before {
    background: rgb(151, 235, 88); /* 同じ背景色 */
  }
  :global(.dark) .item:nth-child(2)::before {
    background: rgb(91, 135, 57); /* 同じ背景色 */
  }

  /* Bump */
  .item:nth-child(3) {
    transform: rotate(90deg) translate(100px);
  }
  .item:nth-child(3)::before {
    background: rgb(233, 85, 85); /* 同じ背景色 */
  }
  :global(.dark) .item:nth-child(3)::before {
    background: rgb(135, 57, 57); /* 同じ背景色 */
  }

  /* Merge */
  .item:nth-child(4) {
    transform: rotate(135deg) translate(100px);
  }
  .item:nth-child(4)::before {
    background: rgb(111, 55, 223); /* 同じ背景色 */
  }
  :global(.dark) .item:nth-child(4)::before {
    background: rgb(83, 57, 135); /* 同じ背景色 */
  }

  /* Docs */
  .item:nth-child(5) {
    transform: rotate(180deg) translate(100px);
  }
  .item:nth-child(5)::before {
    background: rgb(56, 213, 219); /* 同じ背景色 */
  }
  :global(.dark) .item:nth-child(5)::before {
    background: rgb(57, 132, 135); /* 同じ背景色 */
  }

  /* Format */
  .item:nth-child(6) {
    transform: rotate(225deg) translate(100px);
  }
  .item:nth-child(6)::before {
    background: rgb(225, 182, 65); /* 同じ背景色 */
  }
  :global(.dark) .item:nth-child(6)::before {
    background: rgb(135, 114, 57); /* 同じ背景色 */
  }

  /* Test */
  .item:nth-child(7) {
    transform: rotate(270deg) translate(100px);
  }
  .item:nth-child(7)::before {
    background: rgb(48, 207, 66); /* 同じ背景色 */
  }
  :global(.dark) .item:nth-child(7)::before {
    background: rgb(57, 135, 66); /* 同じ背景色 */
  }

  /* Lint */
  .item:nth-child(8) {
    transform: rotate(315deg) translate(100px);
  }
  .item:nth-child(8)::before {
    background: rgb(220, 61, 183); /* 同じ背景色 */
  }
  :global(.dark) .item:nth-child(8)::before {
    background: rgb(135, 57, 117); /* 同じ背景色 */
  }
</style>

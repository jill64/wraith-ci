<script lang="ts">
  import { browser } from '$app/environment'
  import { slide } from 'svelte/transition'

  let circle: HTMLDivElement | undefined
  let angle = $state(0)
  let relativeAngle = $derived(angle % 360)
  let timerId: NodeJS.Timeout | undefined

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
  let isAssign = $derived(relativeAngle === 315)
  let isBump = $derived(relativeAngle === 270)
  let isMerge = $derived(relativeAngle === 225)
  let isDocs = $derived(relativeAngle === 180)
  let isFormat = $derived(relativeAngle === 135)
  let isTest = $derived(relativeAngle === 90)
  let isLint = $derived(relativeAngle === 45)
</script>

<div class="flex flex-wrap justify-center items-center gap-20 my-28">
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
          build
        </button>
      </h2>
      <h2 class="item {isAssign ? 'text-4xl z-10' : 'text-gray-500'}">
        <button
          onclick={() => {
            angle = 315
            rotate(angle)
          }}
        >
          Assign
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
        正しくビルドが行われるかチェックし、アーティファクトが更新されていなければ、自動的にコミットします。
      </p>
    {:else if isAssign}
      <p class="description" transition:slide>
        PRが作成されると、事前に指定されたレビュアーを自動的に割り当てます。
      </p>
    {:else if isBump}
      <p class="description" transition:slide>
        あらかじめ決められたPRメッセージルールに基づいて、package.jsonのバージョンを自動で更新します。
      </p>
    {:else if isMerge}
      <p class="description" transition:slide>
        あらかじめ決められたユーザーからのPRを自動でマージします。
      </p>
    {:else if isDocs}
      <p class="description" transition:slide>
        README.mdやpackage.jsonといったドキュメントを自動更新し、最新の状態に保ちます。
      </p>
    {:else if isFormat}
      <p class="description" transition:slide>
        フォーマットを実行し、差分を自動でコミットします。
      </p>
    {:else if isTest}
      <p class="description" transition:slide>
        各種テストを自動で実行し、カバレッジを取得します。
      </p>
    {:else if isLint}
      <p class="description" transition:slide>
        Lintを実行し、コードの品質を保つための修正を行います。
      </p>
    {/if}
  </div>
</div>

<style>
  .description {
    font-size: 1.5rem;
    font-weight: bold;
  }

  /* 親コンテナ */
  .circle-container {
    position: relative;
    width: 300px;
    height: 300px;
    border-radius: 50%;
  }

  /* 回転する要素（中に8要素を格納） */
  .circle-rotate {
    width: 100%;
    height: 100%;
    position: relative;
    transform: rotate(0deg);
    transition: transform 0.5s; /* 回転を滑らかにする */
  }

  /* 各要素の見た目 */
  .item {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 30px;
    height: 30px;
    margin: -15px 0 0 -15px; /* 中心基準にするため */
    border-radius: 50%;
    color: #fff;
    text-align: center;
    line-height: 30px;
    font-weight: bold;
    transition: all 0.3s;
  }

  .item::before {
    content: '';
    position: absolute;
    top: -30px;
    left: -20px;
    right: -100px;
    bottom: -30px;
    border-radius: 9999px;
    filter: blur(8px); /* ここでぼかし */
    z-index: -1; /* 親要素の背面に配置 */
  }

  /* Build */
  .item:nth-child(1) {
    transform: rotate(0deg) translate(100px);
  }
  .item:nth-child(1)::before {
    background: rgb(57, 57, 135); /* 同じ背景色 */
  }
  :global(.dark) .item:nth-child(1)::before {
    background: rgb(34, 54, 115); /* 同じ背景色 */
  }

  /* Assign */
  .item:nth-child(2) {
    transform: rotate(45deg) translate(100px);
  }
  .item:nth-child(2)::before {
    background: rgb(57, 57, 135); /* 同じ背景色 */
  }
  :global(.dark) .item:nth-child(2)::before {
    background: rgb(91, 135, 57); /* 同じ背景色 */
  }

  /* Bump */
  .item:nth-child(3) {
    transform: rotate(90deg) translate(100px);
  }
  .item:nth-child(3)::before {
    background: rgb(57, 57, 135); /* 同じ背景色 */
  }
  :global(.dark) .item:nth-child(3)::before {
    background: rgb(135, 57, 57); /* 同じ背景色 */
  }

  /* Merge */
  .item:nth-child(4) {
    transform: rotate(135deg) translate(100px);
  }
  .item:nth-child(4)::before {
    background: rgb(57, 57, 135); /* 同じ背景色 */
  }
  :global(.dark) .item:nth-child(4)::before {
    background: rgb(83, 57, 135); /* 同じ背景色 */
  }

  /* Docs */
  .item:nth-child(5) {
    transform: rotate(180deg) translate(100px);
  }
  .item:nth-child(5)::before {
    background: rgb(57, 57, 135); /* 同じ背景色 */
  }
  :global(.dark) .item:nth-child(5)::before {
    background: rgb(57, 132, 135); /* 同じ背景色 */
  }

  /* Format */
  .item:nth-child(6) {
    transform: rotate(225deg) translate(100px);
  }
  .item:nth-child(6)::before {
    background: rgb(57, 57, 135); /* 同じ背景色 */
  }
  :global(.dark) .item:nth-child(6)::before {
    background: rgb(135, 114, 57); /* 同じ背景色 */
  }

  /* Test */
  .item:nth-child(7) {
    transform: rotate(270deg) translate(100px);
  }
  .item:nth-child(7)::before {
    background: rgb(57, 57, 135); /* 同じ背景色 */
  }
  :global(.dark) .item:nth-child(7)::before {
    background: rgb(57, 135, 66); /* 同じ背景色 */
  }

  /* Lint */
  .item:nth-child(8) {
    transform: rotate(315deg) translate(100px);
  }
  .item:nth-child(8)::before {
    background: rgb(57, 57, 135); /* 同じ背景色 */
  }
  :global(.dark) .item:nth-child(8)::before {
    background: rgb(135, 57, 117); /* 同じ背景色 */
  }
</style>

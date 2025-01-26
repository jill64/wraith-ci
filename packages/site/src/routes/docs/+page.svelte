<script lang="ts">
  import { i } from '$lib/i18n'
</script>

<h2 class="text-3xl font-bold">
  {i.translate({ en: 'Getting Started', ja: 'はじめに' })}
</h2>
<p>
  Wraith CIはNode.jsアプリケーション向けのゼロコンフィグから始められるGitHub
  Appです。
</p>
<p>
  <a href="https://github.com/jill64/octoflare">Octoflare</a>
  フレームワークを使用して、Cloudflare WorkerとGitHub ActionsによるCI/CDのためのワークフローを提供します。
</p>
<p>Publicリポジトリのビルドログや各種ログはパブリックに公開されます。</p>
<p>
  Privateリポジトリのビルドログや各種ログはプライベートリポジトリで処理され、パブリックに公開されません。
</p>
<p>
  各処理はGhostという単位で実行され、
  <code>Wraith CI</code>と
  <code>Wraith CI / PR</code>
  という名前でまとめて実行結果がGitHubのステータスチェックに出力されます。
</p>
<p>どれか１つのGhostの処理が失敗した場合、全体の処理が失敗とみなされます。</p>
<p>各Ghostの実行のON・OFFはWebコンソールから設定できます。</p>

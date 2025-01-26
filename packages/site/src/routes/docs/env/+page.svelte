<h2 class="text-3xl font-bold">Ghost Build</h2>

<p>Web Console上で各ワークフローに使用する環境変数を設定できます。</p>
<p>
  設定した環境変数は、ワークフロー上で設定されるほか、
  <code>package.json</code>
  が存在するディレクトリ上に<code>.env</code>ファイルを生成します。
</p>
<p>
  同時に
  <code>.gitignore</code>に
  <code>.env</code>
  が存在するかチェックし、存在しない場合は自動で追加した上で各種処理・コミットが実行されます。
</p>
<p>設定した環境変数はすべて暗号化されて保存・送信されます。</p>

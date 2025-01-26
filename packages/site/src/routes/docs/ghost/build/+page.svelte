<h2 class="text-3xl font-bold">Ghost Build</h2>
<p>
  Ghost Buildはコミットのプッシュ時に<code>package.json</code>に記載された
  <code>build</code>コマンドを検出し、実行します。
</p>
<p>
  また、実行後に
  <code>git diff</code>
  を検知した場合は、コードアーティファクトが更新されたものとみなし、自動でコミットをプッシュします。
</p>

<script lang="ts">
  import FaqItem from './FaqItem.svelte'
</script>

<main class="m-4">
  <h1 class="text-4xl font-bold">FAQ</h1>
  <ul>
    <FaqItem
      question={{
        en: 'Subscription payment processing was completed successfully but is not reflected in the application.',
        ja: 'サブスクリプション支払い処理が正常に完了したのに、アプリケーションに反映されません。'
      }}
      answer={{
        en: `The email address you are logged in with may be different from the email address used for payment processing.
Please confirm that the email address you are logged in with matches the email address used for payment processing. If they are different, please correct them.`,
        ja: `アプリケーションにログインしているメールアドレスと、支払い処理を行ったメールアドレスが異なる可能性があります。
お手数ですが、ログインしているメールアドレスと支払い処理を行ったメールアドレスが一致していることを確認し、異なっている場合は修正をお願いいたします。`
      }}
    />
  </ul>
</main>

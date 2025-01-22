<script lang="ts">
  import { PUBLIC_STAGE } from '$env/static/public'
  import NavigationMenu from '$lib/components/NavigationMenu.svelte'
  import { dict } from '$lib/dict.svelte'
</script>

<NavigationMenu
  list={[
    { href: '/', text: dict('top') },
    { href: '/pricing', text: dict('plan') }
  ]}
/>

{#if PUBLIC_STAGE !== 'prod'}
  <stripe-pricing-table
    pricing-table-id="prctbl_1QjmANBCjaRUB9EUxc6cMLKQ"
    publishable-key="pk_test_51Qjm5rBCjaRUB9EU32ajVaAXQ314APaURrvOXYtCP1IPkLeK1UQbWt8ZQDSX9HafN2Wp6maE9Qbyna8N8Bb4H2YB00oPYw1vxp"
  >
  </stripe-pricing-table>
{:else}
  <stripe-pricing-table
    pricing-table-id="prctbl_1QjmP7BCjaRUB9EU7ejn9ROq"
    publishable-key="pk_live_51Qjm5rBCjaRUB9EUer4LbyjV7Kx0auETHSKCsprfN4HxSSQyko7J0tQohT7QoqLoQp4G9IAKZBcugdFTSRD5hsnr00Sy1RR1SH"
  >
  </stripe-pricing-table>
{/if}

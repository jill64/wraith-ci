<script lang="ts">
  let { data } = $props()
</script>

<main class="mx-4">
  <h2 class="text-3xl font-bold">Accounts</h2>
  <a
    href="/repos/{data.github_user.login}/1"
    class="block p-4 hover:underline pp rounded-lg shadow-md dark:shadow-none dark:border-gray-500"
  >
    <h3 class="text-xl font-bold">{data.github_user.login}</h3>
    <p>{data.github_user.bio}</p>
  </a>
  {#each data.org_list as org}
    <a
      href={`/repos/${org.login}/1`}
      class="block p-4 hover:underline pp rounded-lg shadow-md dark:shadow-none dark:border-gray-500"
    >
      <h3 class="text-xl font-bold">{org.login}</h3>
      <p>{org.description}</p>
    </a>
  {/each}
</main>

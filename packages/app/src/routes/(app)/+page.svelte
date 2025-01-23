<script lang="ts">
  let { data } = $props()
</script>

<a href="/repos/{data.github_user.login}">{data.github_user.name}</a>
{#each data.org_list as org}
  <a
    href={`/repos/${org.login}`}
    class="block p-4 hover:underline pp rounded-lg shadow-md dark:shadow-none dark:border-gray-500"
  >
    <h3 class="text-xl font-bold">{org.login}</h3>
    <p>{org.description}</p>
  </a>
{/each}

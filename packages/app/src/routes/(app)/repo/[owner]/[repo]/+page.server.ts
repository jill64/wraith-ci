export const load = async ({ locals: { kit }, params: { repo, owner } }) => {
  const { data: repository } = await kit.rest.repos.get({
    owner,
    repo
  })

  return {
    repository,
    title: {
      en: `${repo} - Repository`,
      ja: `${repo} - リポジトリ`
    },
    description: {
      en: `Repository ${repo}`,
      ja: `リポジトリ ${repo}`
    }
  }
}

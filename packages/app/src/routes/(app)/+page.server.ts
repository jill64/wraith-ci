export const load = async ({ locals: { kit } }) => {
  const { data: org_list } = await kit.request('GET /user/orgs', {
    per_page: 100
  })

  return {
    org_list,
    title: {
      en: 'Top',
      ja: 'トップ'
    },
    description: {
      en: 'Top page',
      ja: 'トップページ'
    }
  }
}

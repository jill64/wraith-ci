export const load = async ({ locals: { kit, oauth_user } }) => {
  // const { data: org_list } = await kit.request('GET /user/orgs', {
  //   username: oauth_user.name,
  //   per_page: 100
  // })

  return {
    org_list: [],
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

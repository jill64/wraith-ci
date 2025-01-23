export const load = async ({
  locals: { oauth_user, kit },
  params: { page }
}) => {
  const allRepo = await kit.rest.repos.listForUser({
    username: oauth_user.name,
    per_page: 20,
    page: Number(page)
  })

  let lastPage = 0

  console.log(allRepo.headers.link)

  allRepo.headers.link?.split(',').forEach((link) => {
    const [url, rel] = link.split(';').map((str) => str.trim())
    const [, page] = url.match(/&page=(\d+)/) || []

    if (rel === 'rel="last"') {
      lastPage = Number(page)
    }
  })

  if (lastPage === 0) {
    lastPage = Number(page)
  }

  return {
    allRepo,
    lastPage,
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

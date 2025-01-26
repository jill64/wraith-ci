export const load = async ({ locals: { kit }, params: { page, owner } }) => {
  const allRepo = await kit.rest.repos.listForUser({
    username: owner,
    per_page: 20,
    page: Number(page),
    type: 'all'
  })

  let lastPage = 0

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

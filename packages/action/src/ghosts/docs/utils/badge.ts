export const badge =
  (href: string) =>
  ({ src, alt }: { src: string; alt: string }) =>
    /* html */ `<a href="${href}"><img src="${src}" alt="${alt}" /></a>`

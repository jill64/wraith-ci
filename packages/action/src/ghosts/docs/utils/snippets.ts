const BEGIN_FIRST = '<!----- BEGIN GHOST DOCS'
const END_FIRST = '<!----- END GHOST DOCS'
const LAST_TAIL = '----->'

export type DocsTag = 'HEADER' | 'FOOTER' | 'BADGES'

export const tagBegin = (tag: DocsTag) => `${BEGIN_FIRST} ${tag} ${LAST_TAIL}`
export const tagEnd = (tag: DocsTag) => `${END_FIRST} ${tag} ${LAST_TAIL}`

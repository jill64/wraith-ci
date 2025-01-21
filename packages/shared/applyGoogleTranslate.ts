export const applyGoogleTranslate = (url: string, lang: string) =>
  `https://translate.google.com/translate?sl=auto&tl=${lang}&hl=${lang}&u=${url}`

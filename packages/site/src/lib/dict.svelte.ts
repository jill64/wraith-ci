import { dictionary } from '$shared/dictionary'
import { i } from './i18n'

export let dict = (key: keyof typeof dictionary) => i.translate(dictionary[key])

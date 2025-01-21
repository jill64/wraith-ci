import { goto, invalidateAll } from '$app/navigation'
import { page } from '$app/state'
import { toast } from '@jill64/svelte-suite'
import { stringify_error } from './stringify_error'

type Method = 'POST' | 'PUT' | 'DELETE'
type Params = {
  invalidate: (url: string) => boolean
  redirect?: boolean | string
  body?: BodyInit
}

const exec = (method: Method) => async (path: string, params: Params) => {
  const dist = path.startsWith('/') ? path : `${page.url.pathname}/${path}`

  const { body, redirect } = params

  try {
    const res = await fetch(dist, {
      method,
      body
    })

    const ok =
      method === 'POST'
        ? res.status === 201
        : method === 'PUT'
          ? res.status === 200
          : res.status === 204

    if (!ok) {
      const message = await res.text()
      throw new Error(message)
    }

    // await invalidate((x) => params.invalidate(x.href))
    if (method !== 'DELETE') {
      await invalidateAll()
    }

    if (redirect) {
      const redirect_url =
        typeof redirect === 'string' ? redirect : await res.text()

      if (redirect_url) {
        await goto(redirect_url)
      }
    }

    if (method === 'DELETE') {
      await invalidateAll()
    }
  } catch (e) {
    toast.error(e instanceof Error ? e.message : stringify_error(e))
    throw e
  }
}

export const request = {
  get post() {
    return exec('POST')
  },
  get put() {
    return exec('PUT')
  },
  get delete() {
    return exec('DELETE')
  }
}

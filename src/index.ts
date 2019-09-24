import { ITEMS } from './constants'

const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

declare global {
  interface Window {
    __RUNTIME__: {
      culture: {
        availableLocales: string[]
      }
      rootPath?: string
    }
  }
}

const supportedLocales = window.__RUNTIME__ && window.__RUNTIME__.culture && window.__RUNTIME__.culture.availableLocales || []
const rootPath = window.__RUNTIME__ && window.__RUNTIME__.rootPath || ''

const RETRY_STATUSES = [ 408, 425, 429, 500,  501,  502,  503,  504,  505,  506,  507,  508,  510,  511 ]

const canRetry = (status: number) => RETRY_STATUSES.includes(status)

const fetchWithRetry = (url: string, init: RequestInit, maxRetries: number = 3) => {
  let status = 500
  const callFetch = (attempt: number = 0): Promise<any>=>
    fetch(url, init).then((response: any) => {
      status = response.status
      return response.json()
        .then((data: any) => ({response: data, error: null}))
    }).catch((error) => {
      console.error(error)

      if (attempt >= maxRetries || !canRetry(status)) {
        return {response: null, error: {message: 'Maximum number of attempts achieved'}}
      }

      const ms = (2 ** attempt) * 500
      return delay(ms)
        .then(() => callFetch(++attempt))
    })

  return callFetch()
}

const patchSession = (data?: any) => fetchWithRetry(`${rootPath}/api/sessions${window.location.search}`, {
  body: data ? JSON.stringify(data) : '{}',
  credentials: 'same-origin',
  headers: new Headers({ 'Content-Type': 'application/json' }),
  method: 'PATCH',
}).catch(err => console.log('Error while patching session with error: ', err))

const items = `${window.location.search ? '&' : '?'}items=${ITEMS.join(',')}`

const supportedLocalesSearch = supportedLocales.length > 0
  ? `&supportedLocales=${supportedLocales.join(',')}`
  : ''

const sessionPromise = fetchWithRetry(`${rootPath}/api/sessions${window.location.search}${items}${supportedLocalesSearch}`, {
  body: '{}',
  credentials: 'same-origin',
  headers: new Headers({ 'Content-Type': 'application/json' }),
  method: 'POST',
}).catch(err => console.log('Error while loading session with error: ', err));

(window as any).__RENDER_7_SESSION__ = (window as any).__RENDER_8_SESSION__ = {
  patchSession,
  sessionPromise,
}

export {}
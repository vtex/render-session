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
const FETCH_TIMEOUT = 30000

const canRetry = (status: number) => RETRY_STATUSES.includes(status)

const ok = (status: number) => 200 <= status && status < 300

const fetchWithRetry = (url: string, init: RequestInit, maxRetries: number = 1): Promise<void> => {
  let status = 500
  let didTimeOut = false
  console.log('init is  ' + JSON.stringify(init, null, 2))
  const callFetch = (attempt: number = 0): Promise<void> =>
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        didTimeOut = true
        throw new Error('Fetch timed out')
      }, FETCH_TIMEOUT)
      fetch(url, init).then((response) => {
        clearTimeout(timeout)
        if (!didTimeOut) {
          resolve(response)
        }}).catch((err) => {
          console.log('Fetch failed!')
          if (didTimeOut) {
            return
          }
          reject(err)
        })
    }).then((response) => {
      status = (response as any).status
      return ok(status)
        ? { response, error: null }
        : (response as any).json()
        .then((error: any) => ({ response, error }))
        .catch(() => ({ response, error: { message: 'Unable to parse JSON' } }))
    }).then(({ error }: any) => {
      if (error) {
        throw new Error(error.message || 'Unknown error')
      }
    }).catch((error) => {
      console.error(error)

      if (attempt >= maxRetries || !canRetry(status) || didTimeOut) {
        return // no session is fine for now
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

const supportedLocalesSearch = supportedLocales.length > 0
  ? `${window.location.search ? '&' : '?'}supportedLocales=${supportedLocales.join(',')}`
  : ''

const sessionPromise = fetchWithRetry(`${rootPath}/api/sessions${window.location.search}${supportedLocalesSearch}`, {
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

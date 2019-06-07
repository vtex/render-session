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
const rootPath = window.__RUNTIME__ && window.__RUNTIME__.rootPath

const fetchWithRetry = (url: string, init: RequestInit, maxRetries: number = 3): Promise<void> => {
  const callFetch = (attempt: number = 0): Promise<void> =>
    fetch(url, init).then((response) => {
      return response.status >= 200 && response.status < 300
        ? { response, error: null }
        : response.json()
          .then((error) => ({ response, error }))
          .catch(() => ({ response, error: { message: 'Unable to parse JSON' } }))
    }).then(({ error }: any) => {
      if (error) {
        throw new Error(error.message || 'Unknown error')
      }
    }).catch((error) => {
      console.error(error)

      if (attempt >= maxRetries) {
        return // no session is fine for now
      }

      const ms = (2 ** attempt) * 500
      return delay(ms)
        .then(() => callFetch(++attempt))
    })

  return callFetch()
}

const patchSession = (data?: any) => fetchWithRetry(`/api/sessions${window.location.search}`, {
  body: data ? JSON.stringify(data) : '{}',
  credentials: 'same-origin',
  headers: new Headers({ 'Content-Type': 'application/json' }),
  method: 'PATCH',
}).catch(err => console.log('Error while patching session with error: ', err))

const supportedLocalesSearch = supportedLocales.length > 0
  ? `${window.location.search ? '&' : '?'}supportedLocales=${supportedLocales.join(',')}`
  : ''

const rootPathPrefix = rootPath ? rootPath : ''

const sessionPromise = fetchWithRetry(`${rootPathPrefix}/api/sessions${window.location.search}${supportedLocalesSearch}`, {
  body: '{}',
  credentials: 'same-origin',
  headers: new Headers({ 'Content-Type': 'application/json' }),
  method: 'POST',
}).catch(err => console.log('Error while loading session with error: ', err));

(window as any).__RENDER_8_SESSION__ = {
  patchSession,
  sessionPromise,
}

export {}
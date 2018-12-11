const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

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
        throw Error(error)
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

(window as any).__RENDER_SESSION_PROMISE__ = fetchWithRetry(`/api/sessions${window.location.search}`, {
    body: '{}',
    credentials: 'same-origin',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    method: 'POST',
}).catch(err => console.log('Error while loading session with error: ', err))

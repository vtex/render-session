import { SessionResponse, SessionResponseData, RefreshTokenRenewResponse } from './interfaces'

const REFRESH_TOKEN_API = '/api/vtexid/refreshtoken/webstore'
const LOCAL_STORAGE_KEY = 'vid_rt_webstore'
const STATUS = {
  SUCCESS: 'success',
  INVALID_SESSION: 'invalidsession',
  ERROR: 'error'
}
const TTL_30_MIN = 30 * 60 * 1000
const TTL_12_HOURS = 12 * 60 * 60 * 1000
const APPNAME = 'render-session'
const TIMEOUT = 5000

const setItem = (status: string, refreshAfter: Date) =>
  localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify({ status, refreshAfter })
  )

const removeKey = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY)
}

const setError = () =>
  setItem(STATUS.ERROR, new Date(new Date().getTime() + TTL_30_MIN))

const fetchWithTimeout = (url: string, options: RequestInit | undefined, timeout: number): Promise<Response> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error("timeout")), timeout)
    fetch(url, options).then(resolve, reject)
  })
}

export const tryInsertFirstRenewKey = (sessionResponse: SessionResponse) => {
  const localStorage = window.localStorage
  if (!localStorage) return

  const isAuthenticated = (sessionResponse.response as SessionResponseData).namespaces.profile.isAuthenticated.value === "true"
  const keyExists = localStorage.getItem(LOCAL_STORAGE_KEY)

  if (isAuthenticated) {
    if (!keyExists) {
      setItem(STATUS.SUCCESS, new Date(new Date().getTime() + TTL_12_HOURS))
    }
  }
  else if (keyExists) {
    removeKey()
  }
  return sessionResponse
}

export const tryRefreshTokenRenew = async () => {
  const localStorage = window.localStorage
  if (!localStorage) return

  try {
    const now = new Date()

    const curr = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || 'null')
    if (!curr || now < new Date(curr.refreshAfter)) return

    const response = await fetchWithTimeout(REFRESH_TOKEN_API, {
      method: 'POST',
      headers: {
        'vtex-id-ui-version': APPNAME,
        'content-type': 'application/json'
      },
      body: '{}',
    }, TIMEOUT)

    const data: RefreshTokenRenewResponse = await response.json();

    if (!data || !data.status) {
      setError()
      return
    }

    const status = data.status.toLowerCase()

    if (status === STATUS.INVALID_SESSION) {
      removeKey()
      return
    }

    if (status === STATUS.SUCCESS) {  
      const { refreshAfter } = data
      setItem(status, new Date(refreshAfter as string))
      return
    }
    
    setError()
  } catch {
    setError()
  }
}

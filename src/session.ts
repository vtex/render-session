import { deleteCookie, setCookie } from './utils/cookie'
import { fetchWithRetry } from './utils/fetch'

const IMPERSONATED_KEY = 'vtex-impersonated-customer-email'

const setSession = (path: string, querystring: string = '', data?: any) => {
  if (data && data[IMPERSONATED_KEY]) {
    const param = data[IMPERSONATED_KEY]
    if (param && param.value) {
      setCookie(IMPERSONATED_KEY, param.value, 1)
    } else {
      deleteCookie(IMPERSONATED_KEY)
    }
  }
  return fetchWithRetry(`${path}/api/sessions${querystring}`, {
    body: data ? JSON.stringify({ public: data}) : '{}',
    credentials: 'same-origin',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    method: 'POST',
  }).catch(err => console.log('Error while loading session with error: ', err))
}

const patchSession = (path: string, querystring: string = '', data?: any) => fetchWithRetry(`${path}/api/sessions${querystring}`, {
  body: data ? JSON.stringify(data) : '{}',
  credentials: 'same-origin',
  headers: new Headers({ 'Content-Type': 'application/json' }),
  method: 'PATCH',
}).catch(err => console.log('Error while patching session with error: ', err))
 
export const session = {
  patchSession,
  setSession,
}
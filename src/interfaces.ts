declare global {
  export interface Window {
    __RUNTIME__: {
      binding?: {
        id: string
      },
      bindingChanged?: boolean,
      culture: {
        availableLocales: string[]
      }
      rootPath?: string
    }
  }
}

export interface SessionResponse {
  response: SessionResponseData | null,
  error: any,
}

export interface SessionResponseData {
  namespaces: {
    profile: {
      isAuthenticated: {
        value: string
      }
    }
  }
}

export interface RefreshTokenRenewResponse {
  status: string,
  userId: string | null,
  refreshAfter: string | null,
}

import setIOWindow from './io'
declare global {
  interface Window {
    __RUNTIME__: {
      culture: {
        availableLocales: string[]
      }
      rootPath?: string
    },
    __RENDER_7_SESSION__: {
      patchSession: any, 
      sessionPromise: any,
    },
    __RENDER_8_SESSION__: {
      patchSession: any, 
      sessionPromise: any,
    }
  }
}

setIOWindow()

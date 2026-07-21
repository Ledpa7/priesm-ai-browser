/// <reference types="vite/client" />

import type { PriesmDesktopAPI } from '../electron/preload'

declare global {
  interface Window {
    priesm?: PriesmDesktopAPI
  }
}

export {}
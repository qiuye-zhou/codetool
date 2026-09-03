/// <reference types="vite/client" />

declare const __VERSION__: string
declare const __DEV__: boolean
declare const __NAME__: string

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<object, object, any>
  export default component
}

declare const chrome: {
  runtime: {
    getURL(_path: string): string
    lastError?: { message: string }
  }
  contextMenus: {
    create(_createProperties: object, _callback?: () => void): void
    remove(_itemId: string, _callback?: () => void): void
    onClicked: {
      addListener(
        _callback: (
          _info: { menuItemId: string },
          _tab: unknown,
        ) => void,
      ): void
    }
  }
  windows: {
    create(
      _createData: object,
    ): Promise<{ id: number } & Record<string, unknown>>
    get(_windowId: number): Promise<Record<string, unknown>>
    update(_windowId: number, _updateInfo: object): Promise<unknown>
    onRemoved: {
      addListener(_callback: (_windowId: number) => void): void
    }
  }
  action: {
    onClicked: { addListener(_callback: (_tab: unknown) => void): void }
  }
  storage?: {
    local?: {
      get(_keys?: string | string[] | null): Promise<Record<string, unknown>>
      set(_items: Record<string, unknown>): Promise<void>
    }
  }
}

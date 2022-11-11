import * as WebSocket from 'ws'
import { getWebSocketToken } from './websocket.utils'
import { WebSocketModuleOptions, WebSocketModuleAsyncOptions } from './websocket.interface'
import { Provider } from '@nestjs/common'
import { defer, lastValueFrom } from 'rxjs'
import { WEBSOCKET_PROVIDER_NAME, WEBSOCKET_MODULE_OPTIONS } from './websocket.constants'

export async function createWebSocket(_options: WebSocketModuleOptions): Promise<WebSocket> {
  try {
    const { url, protocols, options } = _options
    let ws: WebSocket

    if (protocols) {
      ws = new WebSocket(url, protocols, options)
    } else {
      ws = new WebSocket(url, options)
    }

    return ws
  } catch (err) {
    throw new Error(`The connection cannot be established. ${err}`)
  }
}

export function createWebSocketProvider(options: WebSocketModuleOptions): Provider {
  return {
    provide: getWebSocketToken(),
    useFactory: async (): Promise<WebSocket> => {
      return await lastValueFrom(defer(() => createWebSocket(options)))
    },
  }
}

export function createWebSocketAsyncProvider(): Provider {
  return {
    provide: getWebSocketToken(),
    useFactory: async (options: WebSocketModuleOptions): Promise<WebSocket> => {
      return lastValueFrom(defer(() => createWebSocket(options)))
    },
    inject: [WEBSOCKET_MODULE_OPTIONS],
  }
}

export function createAsyncOptionsProvider(options: WebSocketModuleAsyncOptions): Provider {
  return {
    provide: WEBSOCKET_MODULE_OPTIONS,
    useFactory: options.useFactory,
    inject: options.inject || [],
  }
}

export function createProviderName(): Provider {
  return {
    provide: WEBSOCKET_PROVIDER_NAME,
    useValue: getWebSocketToken(),
  }
}

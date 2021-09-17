import { Inject, SetMetadata } from '@nestjs/common'
import { WEBSOCKET_EVENT_METADATA } from './websocket.constants'
import { getWebSocketToken } from './websocket.utils'

export const InjectWebSocketProvider = () => Inject(getWebSocketToken())

/**
 * Listen to an event that fulfils chosen pattern.
 */
export const EventListener = (event: string) => {
  return SetMetadata(WEBSOCKET_EVENT_METADATA, { event })
}

export const OnOpen = () => {
  return SetMetadata(WEBSOCKET_EVENT_METADATA, { event: 'open' })
}

export const OnClose = () => {
  return SetMetadata(WEBSOCKET_EVENT_METADATA, { event: 'close' })
}

export const OnError = () => {
  return SetMetadata(WEBSOCKET_EVENT_METADATA, { event: 'error' })
}

export const OnMessage = () => {
  return SetMetadata(WEBSOCKET_EVENT_METADATA, { event: 'message' })
}

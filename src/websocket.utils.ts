import { DECORATED_PREFIX } from './websocket.constants'

export function getWebSocketToken(): string {
  return `${DECORATED_PREFIX}:Provider`
}

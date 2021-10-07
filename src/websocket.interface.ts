import { ModuleMetadata } from '@nestjs/common'
import { ClientRequestArgs } from 'http'
import { ClientOptions } from 'ws'
import { URL } from 'url'

export interface WebSocketModuleOptions extends Record<string, any> {
  url: string | URL
  protocols?: string | string[]
  options?: ClientOptions | ClientRequestArgs
}

export interface WebSocketModuleAsyncOptions extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  useFactory: (...args: any[]) => WebSocketModuleOptions | Promise<WebSocketModuleOptions>
  inject?: any[]
}

export interface WebSocketEventMetadata {
  event: string
}

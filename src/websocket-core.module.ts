import { DynamicModule, Global, Inject, Module, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common'
import { DiscoveryModule, DiscoveryService, MetadataScanner, ModuleRef, Reflector } from '@nestjs/core'
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper'
import * as WebSocket from 'ws'
import { WEBSOCKET_PROVIDER_NAME, WEBSOCKET_EVENT_METADATA } from './websocket.constants'
import { WebSocketModuleOptions, WebSocketModuleAsyncOptions, WebSocketEventMetadata } from './websocket.interface'
import {
  createWebSocketProvider,
  createWebSocketAsyncProvider,
  createAsyncOptionsProvider,
  createProviderName,
} from './websocket.provider'

@Global()
@Module({})
export class WebSocketCoreModule implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(
    @Inject(WEBSOCKET_PROVIDER_NAME) private readonly providerName: string,
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}
  static forRoot(options: WebSocketModuleOptions): DynamicModule {
    const socketProvider = createWebSocketProvider(options)

    return {
      module: WebSocketCoreModule,
      imports: [DiscoveryModule],
      providers: [socketProvider, createProviderName()],
      exports: [socketProvider],
    }
  }

  static forRootAsync(options: WebSocketModuleAsyncOptions): DynamicModule {
    const socketProvider = createWebSocketAsyncProvider()
    const asyncOptionsProvader = createAsyncOptionsProvider(options)

    return {
      module: WebSocketCoreModule,
      imports: [DiscoveryModule, ...(options.imports || [])],
      providers: [asyncOptionsProvader, socketProvider, createProviderName(), ...(options.providers || [])],
      exports: [socketProvider],
    }
  }

  onApplicationBootstrap() {
    const providers = this.discoveryService.getProviders()
    const controllers = this.discoveryService.getControllers()

    this.listenToClientEvents(providers) // Add listeners to all the providers
    this.listenToClientEvents(controllers) // Add listeners to all the controllers
  }

  private listenToClientEvents(wrappers: InstanceWrapper<any>[]): void {
    const ws = this.moduleRef.get<WebSocket>(this.providerName)

    wrappers.forEach((wrapper) => {
      const { instance } = wrapper ?? {}

      if (wrapper.isDependencyTreeStatic() && instance) {
        const prototype = Object.getPrototypeOf(instance)

        this.metadataScanner.scanFromPrototype(instance, prototype, (methodKey: string) => {
          const callback = instance[methodKey]
          const metadata = this.reflector.get<WebSocketEventMetadata>(WEBSOCKET_EVENT_METADATA, callback)

          if (metadata) {
            ws.on(metadata.event, (...args: unknown[]) => {
              callback.call(instance, ...args)
            })
          }
        })
      }
    })
  }

  onApplicationShutdown() {
    const ws = this.moduleRef.get<WebSocket>(this.providerName)

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.removeAllListeners()
      ws.terminate()
    }
  }
}

import { Module, DynamicModule } from '@nestjs/common'
import { WebSocketCoreModule } from './websocket-core.module'
import { WebSocketModuleOptions, WebSocketModuleAsyncOptions } from './websocket.interface'

@Module({})
export class WebSocketModule {
  static forRoot(options: WebSocketModuleOptions): DynamicModule {
    return {
      module: WebSocketModule,
      imports: [WebSocketCoreModule.forRoot(options)],
    }
  }

  static forRootAsync(options: WebSocketModuleAsyncOptions): DynamicModule {
    return {
      module: WebSocketModule,
      imports: [WebSocketCoreModule.forRootAsync(options)],
    }
  }
}

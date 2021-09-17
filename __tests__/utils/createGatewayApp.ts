import { Test } from '@nestjs/testing'
import { WsAdapter } from '@nestjs/platform-ws'
import { INestApplication } from '@nestjs/common'
import { ApplicationGateway } from './app.gateway'

export async function createGatewayApp(): Promise<INestApplication> {
  const testingModule = await Test.createTestingModule({
    providers: [ApplicationGateway],
  }).compile()
  const app = await testingModule.createNestApplication()

  app.useWebSocketAdapter(new WsAdapter(app))

  return app
}

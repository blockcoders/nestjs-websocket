import { NestFactory } from '@nestjs/core'
import { Module, Controller, Get, Injectable } from '@nestjs/common'
import * as request from 'supertest'
import { platforms } from './utils/platforms'
import { extraWait } from './utils/extraWait'
import {
  EventListener,
  InjectWebSocketProvider,
  OnError,
  OnMessage,
  OnOpen,
  WebSocketClient,
  WebSocketModule,
} from '../src'
import { createGatewayApp } from './utils/createGatewayApp'
import { randomPort } from './utils/randomPort'

jest.useRealTimers()

describe('Websocket Decorators', () => {
  let port: number

  beforeEach(() => {
    port = randomPort()
  })

  describe('@InjectWebSocketProvider', () => {
    for (const PlatformAdapter of platforms) {
      describe(PlatformAdapter.name, () => {
        it('should inject websocket provider in a service successfully', async () => {
          @Injectable()
          class TestService {
            constructor(
              @InjectWebSocketProvider()
              private readonly ws: WebSocketClient,
            ) {}
            async someMethod(): Promise<number> {
              return this.ws.readyState
            }
          }

          @Controller('/')
          class TestController {
            constructor(private readonly service: TestService) {}
            @Get()
            async get(): Promise<{ status: number }> {
              const status = await this.service.someMethod()

              return { status }
            }
          }

          @Module({
            imports: [
              WebSocketModule.forRoot({
                url: `ws://localhost:${port}`,
              }),
            ],
            controllers: [TestController],
            providers: [TestService],
          })
          class TestModule {}

          const appGateway = await createGatewayApp()
          await appGateway.listen(port)
          const app = await NestFactory.create(TestModule, new PlatformAdapter(), { logger: false })
          const server = app.getHttpServer()

          await app.init()
          await extraWait(PlatformAdapter, app)

          // open websockets delay
          await new Promise((res) => setTimeout(res, 800))

          await request(server)
            .get('/')
            .expect(200)
            .expect((res) => {
              expect(res.body).toBeDefined()
              expect(res.body.status).toEqual(WebSocketClient.OPEN)
            })

          await app.close()
          await appGateway.close()
        })
      })
    }
  })

  describe('@EventListener', () => {
    for (const PlatformAdapter of platforms) {
      describe(PlatformAdapter.name, () => {
        it('should listen a websocket event', async () => {
          @Injectable()
          class TestService {
            private wsOpen = false

            @EventListener('open')
            onOpen() {
              this.wsOpen = true
            }

            async isOpen(): Promise<boolean> {
              return this.wsOpen
            }
          }

          @Controller('/')
          class TestController {
            constructor(private readonly testService: TestService) {}

            @Get()
            async get(): Promise<{ open: boolean }> {
              const open = await this.testService.isOpen()

              return { open }
            }
          }

          @Module({
            imports: [
              WebSocketModule.forRoot({
                url: `ws://localhost:${port}`,
              }),
            ],
            controllers: [TestController],
            providers: [TestService],
          })
          class TestModule {}

          const appGateway = await createGatewayApp()
          await appGateway.listen(port)
          const app = await NestFactory.create(TestModule, new PlatformAdapter(), { logger: false })
          const server = app.getHttpServer()

          await app.init()
          await extraWait(PlatformAdapter, app)

          // open websockets delay
          await new Promise((res) => setTimeout(res, 800))

          await request(server)
            .get('/')
            .expect(200)
            .expect((res) => {
              expect(res.body).toBeDefined()
              expect(res.body.open).toBeTruthy()
            })

          await app.close()
          await appGateway.close()
        })
      })
    }
  })

  describe('@OnOpen', () => {
    for (const PlatformAdapter of platforms) {
      describe(PlatformAdapter.name, () => {
        it('should listen a open event', async () => {
          @Injectable()
          class TestService {
            private wsOpen = false

            @OnOpen()
            onOpen() {
              this.wsOpen = true
            }

            async isOpen(): Promise<boolean> {
              return this.wsOpen
            }
          }

          @Controller('/')
          class TestController {
            constructor(private readonly testService: TestService) {}

            @Get()
            async get(): Promise<{ open: boolean }> {
              const open = await this.testService.isOpen()

              return { open }
            }
          }

          @Module({
            imports: [
              WebSocketModule.forRoot({
                url: `ws://localhost:${port}`,
              }),
            ],
            controllers: [TestController],
            providers: [TestService],
          })
          class TestModule {}

          const appGateway = await createGatewayApp()
          await appGateway.listen(port)
          const app = await NestFactory.create(TestModule, new PlatformAdapter(), { logger: false })
          const server = app.getHttpServer()

          await app.init()
          await extraWait(PlatformAdapter, app)

          // open websockets delay
          await new Promise((res) => setTimeout(res, 800))

          await request(server)
            .get('/')
            .expect(200)
            .expect((res) => {
              expect(res.body).toBeDefined()
              expect(res.body.open).toBeTruthy()
            })

          await app.close()
          await appGateway.close()
        })
      })
    }
  })

  // describe('@OnClose', () => {
  //   jest.setTimeout(40000)
  //   for (const PlatformAdapter of platforms) {
  //     describe(PlatformAdapter.name, () => {
  //       it('should listen a close event', async () => {
  //         @Injectable()
  //         class TestService {
  //           private wsClose = false

  //           @OnClose()
  //           close() {
  //             this.wsClose = true
  //           }

  //           isClose(): boolean {
  //             return this.wsClose
  //           }
  //         }

  //         @Controller('/')
  //         class TestController {
  //           constructor(private readonly testService: TestService) {}

  //           @Get()
  //           get(): { close: boolean } {
  //             const close = this.testService.isClose()

  //             return { close }
  //           }
  //         }

  //         @Module({
  //           imports: [
  //             WebSocketModule.forRoot({
  //               url: `ws://localhost:${port}`,
  //             }),
  //           ],
  //           controllers: [TestController],
  //           providers: [TestService],
  //         })
  //         class TestModule {}

  //         const appGateway = await createGatewayApp()
  //         await appGateway.listen(port)
  //         const app = await NestFactory.create(TestModule, new PlatformAdapter(), { logger: false })
  //         const server = app.getHttpServer()

  //         await app.init()
  //         await extraWait(PlatformAdapter, app)

  //         // open websockets delay
  //         await new Promise((res) => setTimeout(res, 800))

  //         // close the gateway
  //         await appGateway.close()

  //         // close websockets delay
  //         await new Promise((res) => setTimeout(res, 800))

  //         await request(server)
  //           .get('/')
  //           .expect(200)
  //           .expect((res) => {
  //             expect(res.body).toBeDefined()
  //             expect(res.body.close).toBeTruthy()
  //           })

  //         await app.close()
  //       })
  //     })
  //   }
  // })

  describe('@OnError', () => {
    for (const PlatformAdapter of platforms) {
      describe(PlatformAdapter.name, () => {
        it('should listen a error event', async () => {
          @Injectable()
          class TestService {
            private errorMessage = ''

            constructor(
              @InjectWebSocketProvider()
              private readonly ws: WebSocketClient,
            ) {}

            @OnOpen()
            onOpen() {
              this.ws.emit('error', new Error('error occured'))
            }

            @OnError()
            error(err: Error) {
              this.errorMessage = err.message
            }

            async getError(): Promise<string> {
              return this.errorMessage
            }
          }

          @Controller('/')
          class TestController {
            constructor(private readonly testService: TestService) {}

            @Get()
            async get(): Promise<{ message: string }> {
              const message = await this.testService.getError()

              return { message }
            }
          }

          @Module({
            imports: [
              WebSocketModule.forRoot({
                url: `ws://localhost:${port}`,
              }),
            ],
            controllers: [TestController],
            providers: [TestService],
          })
          class TestModule {}

          const appGateway = await createGatewayApp()
          await appGateway.listen(port)
          const app = await NestFactory.create(TestModule, new PlatformAdapter(), { logger: false })
          const server = app.getHttpServer()

          await app.init()
          await extraWait(PlatformAdapter, app)

          // open websockets delay
          await new Promise((res) => setTimeout(res, 800))

          await request(server)
            .get('/')
            .expect(200)
            .expect((res) => {
              expect(res.body).toBeDefined()
              expect(res.body.message).toEqual('error occured')
            })

          await app.close()
          await appGateway.close()
        })
      })
    }
  })

  describe('@OnMessage', () => {
    for (const PlatformAdapter of platforms) {
      describe(PlatformAdapter.name, () => {
        it('should listen a message event', async () => {
          const eventData = {
            event: 'push',
            data: {
              test: 'test',
            },
          }

          @Injectable()
          class TestService {
            private data: Record<any, any> = {}

            constructor(
              @InjectWebSocketProvider()
              private readonly ws: WebSocketClient,
            ) {}

            @OnOpen()
            onOpen() {
              this.ws.send(JSON.stringify(eventData))
            }

            @OnMessage()
            message(data: WebSocketClient.Data) {
              this.data = JSON.parse(data.toString())
            }

            async getData(): Promise<Record<any, any>> {
              return this.data
            }
          }

          @Controller('/')
          class TestController {
            constructor(private readonly testService: TestService) {}

            @Get()
            async get(): Promise<Record<any, any>> {
              const data = await this.testService.getData()

              return data
            }
          }

          @Module({
            imports: [
              WebSocketModule.forRoot({
                url: `ws://localhost:${port}`,
              }),
            ],
            controllers: [TestController],
            providers: [TestService],
          })
          class TestModule {}

          const appGateway = await createGatewayApp()
          await appGateway.listen(port)
          const app = await NestFactory.create(TestModule, new PlatformAdapter(), { logger: false })
          const server = app.getHttpServer()

          await app.init()
          await extraWait(PlatformAdapter, app)

          // open websockets delay
          await new Promise((res) => setTimeout(res, 800))

          await request(server)
            .get('/')
            .expect(200)
            .expect((res) => {
              expect(res.body).toBeDefined()
              expect(res.body).toMatchObject({
                event: 'pop',
                data: eventData.data,
              })
            })

          await app.close()
          await appGateway.close()
        })
      })
    }
  })
})

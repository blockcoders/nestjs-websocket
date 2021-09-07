import { NestFactory } from '@nestjs/core';
import { Module, Injectable, Get, Controller } from '@nestjs/common';
import * as request from 'supertest';
import { platforms } from './utils/platforms';
import { extraWait } from './utils/extraWait';
import { OnOpen, WebSocketModule } from '../src';
import { createGatewayApp } from './utils/createGatewayApp';
import { randomPort } from './utils/randomPort';

describe('WebSocket Module Initialization', () => {
  let port: number;

  beforeEach(() => {
    port = randomPort();
  });

  for (const PlatformAdapter of platforms) {
    describe(PlatformAdapter.name, () => {
      describe('forRoot', () => {
        it('should compile', async () => {
          @Injectable()
          class TestService {
            private wsOpen = false;

            @OnOpen()
            onOpen() {
              this.wsOpen = true;
            }

            async isOpen(): Promise<boolean> {
              return this.wsOpen;
            }
          }

          @Controller('/')
          class TestController {
            constructor(private readonly testService: TestService) {}

            @Get()
            async get(): Promise<{ open: boolean }> {
              const open = await this.testService.isOpen();

              return { open };
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

          const appGateway = await createGatewayApp();
          await appGateway.listen(port);
          const app = await NestFactory.create(
            TestModule,
            new PlatformAdapter(),
            { logger: false },
          );
          const server = app.getHttpServer();

          await app.init();
          await extraWait(PlatformAdapter, app);

          // open websockets delay
          await new Promise((res) => setTimeout(res, 800));

          await request(server)
            .get('/')
            .expect(200)
            .expect((res) => {
              expect(res.body).toBeDefined();
              expect(res.body.open).toBeTruthy();
            });

          await app.close();
          await appGateway.close();
        });
      });

      describe('forRootAsync', () => {
        it('should compile', async () => {
          @Injectable()
          class TestService {
            private wsOpen = false;

            @OnOpen()
            onOpen() {
              this.wsOpen = true;
            }

            async isOpen(): Promise<boolean> {
              return this.wsOpen;
            }
          }

          @Controller('/')
          class TestController {
            constructor(private readonly testService: TestService) {}

            @Get()
            async get(): Promise<{ open: boolean }> {
              const open = await this.testService.isOpen();

              return { open };
            }
          }

          @Injectable()
          class ConfigService {
            public readonly websocket_url = `ws://localhost:${port}`;
          }

          @Module({
            imports: [
              WebSocketModule.forRootAsync({
                providers: [ConfigService],
                inject: [ConfigService],
                useFactory: (config: ConfigService) => {
                  return {
                    url: config.websocket_url,
                  };
                },
              }),
            ],
            controllers: [TestController],
            providers: [TestService],
          })
          class TestModule {}

          const appGateway = await createGatewayApp();
          await appGateway.listen(port);
          const app = await NestFactory.create(
            TestModule,
            new PlatformAdapter(),
            { logger: false },
          );
          const server = app.getHttpServer();

          await app.init();
          await extraWait(PlatformAdapter, app);

          // open websockets delay
          await new Promise((res) => setTimeout(res, 800));

          await request(server)
            .get('/')
            .expect(200)
            .expect((res) => {
              expect(res.body).toBeDefined();
              expect(res.body.open).toBeTruthy();
            });

          await app.close();
          await appGateway.close();
        });

        it('should work properly when useFactory returns Promise', async () => {
          @Injectable()
          class TestService {
            private wsOpen = false;

            @OnOpen()
            onOpen() {
              this.wsOpen = true;
            }

            async isOpen(): Promise<boolean> {
              return this.wsOpen;
            }
          }

          @Controller('/')
          class TestController {
            constructor(private readonly testService: TestService) {}

            @Get()
            async get(): Promise<{ open: boolean }> {
              const open = await this.testService.isOpen();

              return { open };
            }
          }

          @Injectable()
          class ConfigService {
            public readonly websocket_url = `ws://localhost:${port}`;
          }

          @Module({
            imports: [
              WebSocketModule.forRootAsync({
                providers: [ConfigService],
                inject: [ConfigService],
                useFactory: async (config: ConfigService) => {
                  await new Promise((r) => setTimeout(r, 20));

                  return {
                    url: config.websocket_url,
                  };
                },
              }),
            ],
            controllers: [TestController],
            providers: [TestService],
          })
          class TestModule {}

          const appGateway = await createGatewayApp();
          await appGateway.listen(port);
          const app = await NestFactory.create(
            TestModule,
            new PlatformAdapter(),
            { logger: false },
          );
          const server = app.getHttpServer();

          await app.init();
          await extraWait(PlatformAdapter, app);

          // open websockets delay
          await new Promise((res) => setTimeout(res, 800));

          await request(server)
            .get('/')
            .expect(200)
            .expect((res) => {
              expect(res.body).toBeDefined();
              expect(res.body.open).toBeTruthy();
            });

          await app.close();
          await appGateway.close();
        });
      });
    });
  }
});

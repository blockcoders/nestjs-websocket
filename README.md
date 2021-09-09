# NestJS-Websocket

[![npm](https://img.shields.io/npm/v/nestjs-websocket)](https://www.npmjs.com/package/nestjs-websocket)
[![CircleCI](https://circleci.com/gh/blockcoders/nestjs-websocket/tree/main.svg?style=svg)](https://circleci.com/gh/blockcoders/nestjs-websocket/tree/main)
[![Coverage Status](https://coveralls.io/repos/github/blockcoders/nestjs-websocket/badge.svg?branch=main)](https://coveralls.io/github/blockcoders/nestjs-websocket?branch=main)
[![vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/nestjs-websocket)](https://snyk.io/test/github/blockcoders/nestjs-websocket)
[![supported platforms](https://img.shields.io/badge/platforms-Express%20%26%20Fastify-green)](https://img.shields.io/badge/platforms-Express%20%26%20Fastify-green)

Websocket utility for NestJS based on [WS](https://www.npmjs.com/package/ws)

## Install

```sh
npm i nestjs-websocket
```

## Register module

### Configuration params

The url param that websocket module expects should be a string, for example:

```ts
{
  url: 'ws://localhost:3000',
}
```

### Synchronous configuration

Use `WebSocketModule.forRoot` method with [String param](#configuration-params):

```ts
import { WebSocketModule } from 'nestjs-websocket'

@Module({
  imports: [
    WebSocketModule.forRoot({
      url: 'ws://localhost:3000',
    }),
  ],
  ...
})
class MyModule {}
```

### Asynchronous configuration

`WebSocketModule.forRootAsync` allows you, for example, inject `ConfigService` to use it in Nest `useFactory` method.

`useFactory` should return an object with [String param](#configuration-params).

```ts
import { WebSocketModule } from 'nestjs-websocket'

@Injectable()
@Module({
  imports: [
    WebSocketModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          url: 'ws://localhost:3000'
        }
      },
    }),
  ],
  ...
})
class MyModule {}
```

## Testing a class that uses @InjectWebSocketProvider

This package exposes a `getWebSocketToken()` function that returns a prepared injection token based on the provided context.
Using this token, you can easily provide a mock implementation of the [WS](https://github.com/websockets/ws) using any of the standard custom provider techniques, including useClass, useValue, and useFactory.

```ts
const module: TestingModule = await Test.createTestingModule({
  providers: [
    MyService,
    {
      provide: getWebSocketToken(),
      useValue: mockProvider,
    },
  ],
}).compile();
```

## Change Log

See [Changelog](CHANGELOG.md) for more information.

## Contributing

Contributions welcome! See [Contributing](CONTRIBUTING.md).

## Authors

- [**Jose Ramirez**](https://github.com/jarcodallo), [Twitter](https://twitter.com/jarcodallo), [NPM](https://www.npmjs.com/~jarcodallo)
- [**Ana Riera**](https://github.com/AnnRiera)

## License

Licensed under the Apache 2.0 - see the [LICENSE](LICENSE) file for details.

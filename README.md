# NestJS-Websocket

[![npm](https://img.shields.io/npm/v/nestjs-websocket)](https://www.npmjs.com/package/nestjs-websocket)
[![CircleCI](https://circleci.com/gh/blockcoders/nestjs-websocket/tree/main.svg?style=svg)](https://circleci.com/gh/blockcoders/nestjs-websocket/tree/main)
[![Coverage Status](https://coveralls.io/repos/github/blockcoders/nestjs-websocket/badge.svg?branch=main)](https://coveralls.io/github/blockcoders/nestjs-websocket?branch=main)
[![vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/nestjs-websocket)](https://snyk.io/test/github/blockcoders/nestjs-websocket)
[![supported platforms](https://img.shields.io/badge/platforms-Express%20%26%20Fastify-green)](https://img.shields.io/badge/platforms-Express%20%26%20Fastify-green)

Websocket Client for NestJS based on [ws](https://www.npmjs.com/package/ws)

## Install

```sh
npm i nestjs-websocket
```

## Register module

### Configuration params

`nestjs-websocket` can be configured with this options:

```ts
/**
 * WebSocket Client options
 * @see {@link https://github.com/websockets/ws/blob/master/doc/ws.md#class-websocket}
 */
interface WebSocketModuleOptions {
  /**
   * Required parameter a URL to connect to.
   * such as http://localhost:3000 or wss://localhost:3000.
   */
  url: string | URL;

  /**
   * Optional parameter a list of subprotocols.
   */
  protocols?: string | string[]
  
  /**
   * Optional parameter a client or http request options.
   */
  options?: ClientOptions | ClientRequestArgs
}
```

### Synchronous configuration

Use `WebSocketModule.forRoot` method with [Options interface](#configuration-params):

```ts
import { WebSocketModule } from 'nestjs-websocket'

@Module({
  imports: [
    WebSocketModule.forRoot({
      url: 'ws://localhost:3000',
      protocols: ['foo', 'bar'],
      options: {
        followRedirects: false,
        handshakeTimeout: 10000,
        maxPayload: 2000000,
        maxRedirects: 10,
        origin: 'http:/example.com',
        perMessageDeflate: false,
        protocolVersion: 1,
        skipUTF8Validation: false,
      },
    }),
  ],
  ...
})
class MyModule {}
```

### Asynchronous configuration

With `WebSocketModule.forRootAsync` you can, for example, import your `ConfigModule` and inject `ConfigService` to use it in `useFactory` method.

`useFactory` should return object with [Options interface](#configuration-params)

Here's an example:

```ts
import { Module, Injectable } from '@nestjs/common'
import { WebSocketModule } from 'nestjs-websocket'

@Injectable()
class ConfigService {
  public readonly url = 'ws://localhost:3000'
}

@Module({
  providers: [ConfigService],
  exports: [ConfigService]
})
class ConfigModule {}

@Module({
  imports: [
    WebSocketModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          url: config.url,
        }
      },
    }),
  ],
  ...
})
class MyModule {}
```

Or you can just pass `ConfigService` to `providers`, if you don't have any `ConfigModule`:

```ts
import { Module, Injectable } from '@nestjs/common'
import { WebSocketModule } from 'nestjs-websocket'

@Injectable()
class ConfigService {
  public readonly url = 'ws://localhost:3000'
}

@Module({
  imports: [
    WebSocketModule.forRootAsync({
      providers: [ConfigService],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          url: config.url,
        }
      },
    }),
  ],
  controllers: [TestController]
})
class TestModule {}
```

## WebSocketClient

`WebSocketClient` implements a [WebSocket](https://github.com/websockets/ws/blob/master/doc/ws.md#class-websocket). So if you are familiar with it, you are ready to go.

```ts
import { Injectable } from '@nestjs/common'
import {
  InjectWebSocketProvider,
  WebSocketClient,
  OnOpen,
  OnMessage,
} from 'nestjs-websocket';

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
```

## Websocket Events

### EventListener

`@EventListener` decorator will handle any event emitted from websocket server.

```ts
import { Injectable } from '@nestjs/common'
import { ClientRequest, IncomingMessage } from 'http'
import {
  EventListener
} from 'nestjs-websocket';

@Injectable()
class TestService {
  @EventListener('open')
  open() {
    console.log('The connection is established.')
  }
  
  @EventListener('ping')
  ping(data: Buffer) {
    console.log(`A ping ${data.toString()} is received from the server.`)
  }
  
  @EventListener('unexpected-response')
  unexpectedResponse(request: ClientRequest, response: IncomingMessage) {
    console.log(`The server response ${response} is not the expected one.`)
  }
  
  @EventListener('upgrade')
  upgrade(response: IncomingMessage) {
    console.log(`Response headers ${response} are received from the server as part of the handshake.`)
  }
}
```

### OnOpen

`@OnOpen` is a shortcut for `@EventListener('open')`. Event emitted when the connection is established.

```ts
import { Injectable } from '@nestjs/common'
import {
  OnOpen
} from 'nestjs-websocket';

@Injectable()
class TestService {
  @OnOpen()
  open() {
    console.log('The connection is established.')
  }
}
```

### OnClose

`@OnClose` is a shortcut for `@EventListener('close')` Event emitted when the connection is closed. `code` property is a numeric value for status code explaining why the connection has been closed. `reason` is a Buffer containing a human-readable string explaining why the connection has been closed.

```ts
import { Injectable } from '@nestjs/common'
import {
  OnClose
} from 'nestjs-websocket';

@Injectable()
class TestService {
  @OnClose()
  close(code: number, reason: string) {
    console.log(`The connection is closed. Reason: ${code} - ${reason}`)
  }
}
```

### OnError

`@OnError` is a shortcut for `@EventListener('error')`. Event emitted when an error occurs. Errors may have a [.code](https://github.com/websockets/ws/blob/HEAD/doc/ws.md#ws-error-codes) property.

```ts
import { Injectable } from '@nestjs/common'
import {
  OnError
} from 'nestjs-websocket';

@Injectable()
class TestService {
  @OnError()
  error(err: Error) {
    console.log(`An error occurs: ${err}`)
  }
}
```

### OnMessage

`@OnMessage` is a shortcut for `@EventListener('message')`. Event emitted when a message is received. `data` is the message content.

```ts
import { Injectable } from '@nestjs/common'
import {
  OnMessage
} from 'nestjs-websocket';

@Injectable()
class TestService {
  @OnMessage()
  message(data: WebSocketClient.Data) {
    console.log(`Data received: ${JSON.parse(data.toString())}`)
  }
}
```

## Testing a class that uses @InjectWebSocketProvider

This package exposes a `getWebSocketToken()` function that returns a prepared injection token based on the provided context.
Using this token, you can easily provide a mock implementation of the [ws](https://github.com/websockets/ws) using any of the standard custom provider techniques, including useClass, useValue, and useFactory.

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

- [**Jose Ramirez**](https://github.com/0xslipk)
- [**Ana Riera**](https://github.com/AnnRiera)

## License

Licensed under the Apache 2.0 - see the [LICENSE](LICENSE) file for details.

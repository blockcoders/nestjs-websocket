import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'

@WebSocketGateway()
export class ApplicationGateway {
  @SubscribeMessage('push')
  onPush(@MessageBody() data: Record<any, any>) {
    return {
      event: 'pop',
      data,
    }
  }
}

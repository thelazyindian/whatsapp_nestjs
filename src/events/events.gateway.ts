import { Logger } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GetMessagesDto } from 'src/message/dtos/message.dto';
import { RoomService } from 'src/room/room.service';
import CustomSocket from './custom-socket.type';
import EventsService from './events.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
    constructor(
        private readonly socketService: EventsService,
        private readonly roomService: RoomService,
    ) { }

    private readonly logger: Logger = new Logger(EventsGateway.name);

    afterInit(): void {
        this.logger.log('WS initialized');
        this.server.use(this.socketService.authenticateClient);
        this.logger.log('WS authenticated');
    }

    async handleConnection(client: CustomSocket): Promise<void> {
        this.logger.log(`WS connected (${client.id})`);
        client.use(await this.socketService.validateEvent(client));
    }

    handleDisconnect(client: CustomSocket): void {
        this.logger.log(`WS disconnected (${client.id}) ${JSON.stringify(client.user)}`);
    }

    @SubscribeMessage('stream-room-messages')
    async streamRoomMessages(
        @MessageBody() data: GetMessagesDto,
        @ConnectedSocket() client: CustomSocket,
    ): Promise<any> {
        try {
            const rooms = await this.roomService.getRooms(client.user.id, { id: data.roomId });
            if (rooms) {
                client.join(data.roomId);
            } else {
                client.disconnect(true);
            }
        }
        catch (error) {
            this.logger.error(`Error: ${error}`);
            client.disconnect(true);
        }
        return;
    }

    @SubscribeMessage('typing')
    typing(
        @MessageBody() data: { roomId: string, isTyping: boolean },
        @ConnectedSocket() client: CustomSocket,
    ): any {
        this.server.to(data.roomId).emit('typing', {
            userId: client.user.id,
            userName: client.user.name,
            userPhone: client.user.phone,
            isTyping: data.isTyping
        });
        return;
    }
}
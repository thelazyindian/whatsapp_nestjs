import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { RoomModule } from 'src/room/room.module';
import { EventsGateway } from './events.gateway';
import EventsService from './events.service';

@Module({
    imports: [AuthModule, RoomModule],
    providers: [EventsGateway, EventsService],
    exports: [EventsGateway],
})
export class EventsModule { }
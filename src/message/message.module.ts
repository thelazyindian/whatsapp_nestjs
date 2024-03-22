import { Module } from '@nestjs/common';
import { EventsModule } from 'src/events/events.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
    imports: [EventsModule],
    controllers: [MessageController],
    providers: [MessageService, PrismaService],
    exports: [MessageService],
})
export class MessageModule { }

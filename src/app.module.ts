import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtGuard } from './auth/guards/jwt.guard';
import { JwtStrategy } from './auth/strategy/jwt.strategy';
import { LocalStrategy } from './auth/strategy/local.strategy';
import { EventsModule } from './events/events.module';
import { RoomModule } from './room/room.module';
import { UsersModule } from './users/users.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    RoomModule,
    MessageModule,
    EventsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    LocalStrategy,
    JwtStrategy,
  ],
})
export class AppModule { }

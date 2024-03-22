import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { User } from 'src/auth/decorators/user.decorator';
import { CreateRoomDto, GetRoomsDto, UpdateRoomDto } from './dtos/room.dto';
import { RoomEntity } from './entities/room.entity';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get('get')
  async get(@User() user, @Body() getRooms: GetRoomsDto): Promise<RoomEntity[]> {
    return this.roomService.getRooms(user.id, getRooms);
  }

  @Put('update')
  async update(@User() user, @Body() profile: UpdateRoomDto): Promise<RoomEntity> {
    return this.roomService.updateRoom(user.id, profile);
  }

  @Post('create')
  async create(@User() user, @Body() createRoom: CreateRoomDto): Promise<RoomEntity> {
    return this.roomService.createRoom(user.id, createRoom);
  }
}

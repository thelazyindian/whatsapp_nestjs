import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Activity, ChatRoom, RoomType, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoomEntity } from './entities/room.entity';
import { RegisterRequestDto } from 'src/auth/dtos/register-request.dto';
import { CreateRoomDto, GetRoomsDto, UpdateRoomDto } from './dtos/room.dto';

@Injectable()
export class RoomService {
  constructor(private readonly prisma: PrismaService) { }

  async createRoom(userId: string, createRoom: CreateRoomDto): Promise<RoomEntity> {
    try {
      const { id, name, image, description, type, creator, participants } = await this.prisma.chatRoom.create({
        data: {
          name: createRoom.name,
          description: createRoom.description,
          image: createRoom.image,
          type: createRoom.type,
          creator: {
            connect: { id: userId },
          },
          participants: {
            connect: [{ id: userId }, ...createRoom.participantIds.map(e => { return { id: e } })],
          }
        },
        include: {
          creator: true,
          participants: true,
        }
      });

      return { id, name, image, description, type, creator, participants }
    } catch (e) {
      throw new HttpException('Some Error', HttpStatus.BAD_REQUEST);
    }
  }

  async updateRoom(userId: string, updateRoom: UpdateRoomDto): Promise<RoomEntity> {
    try {
      const { id, name, image, description, type, creator, participants } = await this.prisma.chatRoom.update({
        where: {
          id: updateRoom.id,
          creatorId: userId,
        },
        data: {
          name: updateRoom.name ? updateRoom.name : undefined,
          description: updateRoom.description ? updateRoom.description : undefined,
          image: updateRoom.image ? updateRoom.image : undefined,
        },
        include: {
          creator: true,
          participants: true,
        }
      });

      return { id, name, image, description, type, creator, participants }
    } catch (e) {
      throw new HttpException('Some Error', HttpStatus.BAD_REQUEST);
    }
  }

  async getRooms(userId: string, getRoom: GetRoomsDto): Promise<RoomEntity[]> {
    try {
      const rooms = await this.prisma.chatRoom.findMany({
        take: getRoom.limit ? getRoom.limit : undefined,
        skip: getRoom.next ? 1 : undefined,
        cursor: getRoom.next ? { id: getRoom.next } : undefined,
        where: {
          participants: {
            some: {
              id: userId
            }
          },
          AND: getRoom.id ? {
            id: getRoom.id,
          } : undefined
        },
        include: {
          _count: true,
          creator: true,
          participants: true,
          messages: {
            take: 1,
          }
        },
        orderBy: {
          lastMessagedAt: 'desc',
        }
      });

      return rooms.map(({ id, name, image, description, type, creator, participants }) => {
        return {
          id,
          name: type === RoomType.PRIVATE ? participants.filter(e => e.id !== userId)[0].phone : name,
          image,
          description,
          type,
          creator: {
            id: creator.id,
            email: creator.email,
            name: creator.name,
            phone: creator.phone,
            image: creator.image,
            activity: creator.activity,
          },
          participants: participants.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            image: user.image,
            activity: user.activity,
          }))
        }
      })
    } catch (e) {
      throw new HttpException('Some Error', HttpStatus.BAD_REQUEST);
    }
  }
}

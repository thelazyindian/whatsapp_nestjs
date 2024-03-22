import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetMessagesDto, SendMessageDto, SendReactionDto } from './dtos/message.dto';
import { MessageEntity } from './entities/message.entity';
import { ReactionEntity } from './entities/reaction.entity';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async sendMessage(userId: string, sendMessage: SendMessageDto): Promise<MessageEntity> {
    try {
      const { id, message, status, attachments, createdAt, updatedAt } = await this.prisma.chatMessage.create({
        data: {
          message: sendMessage.message,
          attachments: sendMessage.attachments ? {
            create:
              sendMessage.attachments.map(e => ({
                type: e.type,
                url: e.url,
                size: e.size,
              }))
          } : undefined,
          sender: {
            connect: { id: userId }
          },
          room: {
            connect: { id: sendMessage.roomId }
          }
        },
        include: {
          attachments: true,
        }
      });

      return {
        id, message,
        attachments: attachments.map(e => ({
          id: e.id,
          type: e.type,
          url: e.url,
          size: e.size,
        })),
        status,
        createdAt,
        updatedAt
      };
    } catch (e) {
      throw new HttpException('Some Error', HttpStatus.BAD_REQUEST);
    }
  }

  async sendReaction(userId: string, sendMessage: SendReactionDto): Promise<ReactionEntity> {
    try {
      const { id, messageId, type, createdAt, updatedAt } = await this.prisma.reactionMessage.create({
        data: {
          type: sendMessage.reaction,
          message: {
            connect: { id: sendMessage.messageId }
          },
          sender: {
            connect: { id: userId }
          },
        },
      });

      return { id, messageId, type, createdAt, updatedAt };
    } catch (e) {
      throw new HttpException('Some Error', HttpStatus.BAD_REQUEST);
    }
  }

  // async updateRoom(userId: string, updateRoom: UpdateRoomDto): Promise<RoomEntity> {
  //   try {
  //     const { id, name, image, description, type, creator, participants } = await this.prisma.chatRoom.update({
  //       where: {
  //         id: updateRoom.id,
  //         creatorId: userId,
  //       },
  //       data: {
  //         name: updateRoom.name ? updateRoom.name : undefined,
  //         description: updateRoom.description ? updateRoom.description : undefined,
  //         image: updateRoom.image ? updateRoom.image : undefined,
  //       },
  //       include: {
  //         creator: true,
  //         participants: true,
  //       }
  //     });

  //     return { id, name, image, description, type, creator, participants }
  //   } catch (e) {
  //     throw new HttpException('Some Error', HttpStatus.BAD_REQUEST);
  //   }
  // }

  async getMessages(userId: string, getMessage: GetMessagesDto): Promise<MessageEntity[]> {
    try {
      const messages = await this.prisma.chatMessage.findMany({
        take: getMessage.limit ? getMessage.limit : undefined,
        skip: getMessage.next ? 1 : undefined,
        cursor: getMessage.next ? { id: getMessage.next } : undefined,
        where: {
          roomId: getMessage.roomId,
        },
        include: {
          _count: true,
          sender: true,
          reactions: {
            include: {
              sender: true,
            }
          },
          attachments: true,
          repliedTo: true,
          forwardedFrom: true,
        },
        orderBy: {
          createdAt: 'desc',
        }
      });

      return messages.map(({ id,
        message,
        attachments,
        reactions,
        repliedTo,
        forwardedFrom,
        status,
        sender,
        createdAt,
        updatedAt }) =>
      ({
        id,
        message,
        attachments: attachments.map(({ id, type, url, size, }) => ({ id, type, url, size })),
        reactions: reactions.map(({ id, type, sender, createdAt, updatedAt }) => ({
          id, type, sender: {
            id: sender.id,
            name: sender.name,
            image: sender.image,
            email: sender.email,
            phone: sender.phone,
            activity: sender.activity,
          }, createdAt, updatedAt
        })),
        repliedTo: repliedTo ? {
          id: repliedTo.id,
          message: repliedTo.message,
          status: repliedTo.status,
          createdAt: repliedTo.createdAt,
          updatedAt: repliedTo.updatedAt,
        } : undefined,
        forwardedFrom: forwardedFrom?  {
          id: forwardedFrom.id,
          message: forwardedFrom.message,
          status: forwardedFrom.status,
          createdAt: forwardedFrom.createdAt,
          updatedAt: forwardedFrom.updatedAt,
        } : undefined,
        status,
        sender: {
          id: sender.id,
          name: sender.name,
          image: sender.image,
          email: sender.email,
          phone: sender.phone,
          activity: sender.activity,
        },
        createdAt,
        updatedAt
      })
      )
    } catch (e) {
      console.log(e)
      throw new HttpException('Some Error', HttpStatus.BAD_REQUEST);
    }
  }
}

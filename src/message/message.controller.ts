import { Body, Controller, Get, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AttachmentType } from '@prisma/client';
import { diskStorage } from 'multer';
import { User } from 'src/auth/decorators/user.decorator';
import { EventsGateway } from 'src/events/events.gateway';
import { GetMessagesDto, SendMessageDto, SendReactionDto } from './dtos/message.dto';
import { MessageEntity } from './entities/message.entity';
import { ReactionEntity } from './entities/reaction.entity';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly eventsGateway: EventsGateway,
  ) { }

  @Get('getHistory')
  async getHistory(@User() user, @Body() getMsgs: GetMessagesDto): Promise<MessageEntity[]> {
    return this.messageService.getMessages(user.id, getMsgs);
  }

  @Post('send')
  @UseInterceptors(FilesInterceptor('files', 10,
    {
      storage: diskStorage({
        destination: (req, file, cb) => {
          let path = './';
          if (file.mimetype.startsWith('image/')) {
            path += 'picture/';
          } else if (file.mimetype.startsWith('video/')) {
            path += 'video/';
          } else {
            path += 'other/';
            return;
          }
          cb(null, path);
        },
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      }
    }
  ))
  async send(
    @User() user,
    @Body() send: SendMessageDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
        ],
        fileIsRequired: false,
      },),
    ) files: Array<Express.Multer.File>
  ): Promise<MessageEntity> {
    const message = await this.messageService.sendMessage(user.id,
      {
        attachments: files.length > 0 ?
          files.map(e => ({
            type: e.mimetype.startsWith('image/') ?
              AttachmentType.PHOTO : e.mimetype.startsWith('video/') ?
                AttachmentType.VIDEO : AttachmentType.FILE,
            url: e.path,
            size: e.size
          })) : undefined,
        ...send
      });

    this.eventsGateway.server.to(send.roomId).emit('messages', message);
    return message;
  }

  @Post('react')
  async react(@User() user, @Body() send: SendReactionDto): Promise<ReactionEntity> {
    const reaction = await this.messageService.sendReaction(user.id, send);

    this.eventsGateway.server.to(send.roomId).emit('reactions', reaction);
    return reaction;
  }
}

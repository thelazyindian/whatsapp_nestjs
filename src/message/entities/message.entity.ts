import { ChatMessage, MessageStatus } from "@prisma/client";
import { UserEntity } from "src/users/entities/users.entity";
import { AttachmentEntity } from "./attachment.entity";
import { ReactionEntity } from "./reaction.entity";

export class MessageEntity {
    id: string;
    message: string;
    attachments?: AttachmentEntity[];
    reactions?: ReactionEntity[];
    repliedTo?: MessageEntity;
    forwardedFrom?: MessageEntity;
    status: MessageStatus;
    sender?: UserEntity;
    createdAt: Date;
    updatedAt: Date;
  }

 const mapMessageEntity = (msg): MessageEntity => ({
  id: msg.id, 
  message: msg.message, 
  attachments: msg.attachments.map(e => ({
    id: e.id,
    type: e.type,
    url: e.url,
    size: e.size,
  })),
  status: msg.status,
  createdAt: msg.createdAt,
  updatedAt: msg.updatedAt
 })
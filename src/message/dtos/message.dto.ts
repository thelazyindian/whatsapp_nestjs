import { Reaction } from "@prisma/client";
import { AttachmentEntity } from "../entities/attachment.entity";

export class SendMessageDto {
    roomId: string;
    message: string;
    attachments?: AttachmentEntity[];
}

export class SendReactionDto {
    roomId: string;
    messageId: string;
    reaction: Reaction;
}

export class GetMessagesDto {
    roomId: string;
    next?: string;
    limit?: number;
}
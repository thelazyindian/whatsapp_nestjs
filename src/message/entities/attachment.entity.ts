import { AttachmentType } from "@prisma/client";

export class AttachmentEntity {
    id?: string;
    type: AttachmentType;
    url: string;
    size: number;
  }
  
import { Reaction } from "@prisma/client";
import { UserEntity } from "src/users/entities/users.entity";

export class ReactionEntity {
  id: string;
  type: Reaction;
  sender?: UserEntity;
  messageId?: string;
  createdAt: Date;
  updatedAt: Date;
}

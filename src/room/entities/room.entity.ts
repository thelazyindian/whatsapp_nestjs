import { Activity, RoomType } from "@prisma/client";
import { UserEntity } from "src/users/entities/users.entity";

export class RoomEntity {
    id: string;
    name: string;
    description?: string;
    image?: string;
    type: RoomType;
    creator: UserEntity;
    participants: UserEntity[];
}
import { RoomType } from "@prisma/client"

export class CreateRoomDto {
    name?: string;
    description?: string;
    image?: string;
    type: RoomType;
    participantIds: string[];
}

export class UpdateRoomDto {
    id: string;
    name?: string;
    description?: string;
    image?: string;
    participantIds: string[];
}

export class GetRoomsDto {
    id?: string;
    next?: string;
    limit?: number;
}
import { Activity } from "@prisma/client";

export class UpdateProfileDto {
    name?: string;
    image?: string;
    activity?: Activity;
}
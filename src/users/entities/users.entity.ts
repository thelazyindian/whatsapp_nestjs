import { Activity } from "@prisma/client";

export class UserEntity {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    image: string;
    activity: Activity;
}
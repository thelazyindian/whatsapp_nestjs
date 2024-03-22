import { User } from '@prisma/client';
import { Socket } from 'socket.io';

export default interface CustomSocket extends Socket {
    user: User,
}
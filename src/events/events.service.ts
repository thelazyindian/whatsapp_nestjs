import { Injectable, Logger } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import * as jwt from 'jsonwebtoken';
import { AuthService } from "src/auth/auth.service";
import CustomSocket from "./custom-socket.type";

@Injectable()
export default class EventsService {
    private readonly logger: Logger = new Logger(EventsService.name);
    constructor(
        private readonly authService: AuthService,
    ) { }

    authenticateClient = async (client: CustomSocket, next: (error?: Error) => void): Promise<void> => {
        try {
            const authHeader: string = client.handshake.headers.authorization as string
            const AuthorizationToken = authHeader.split('Bearer ')[1];
            const userData: any = jwt.decode(AuthorizationToken)
            if (!userData) {
                return next(new WsException('Unauthorized'));
            } else {
                const user = await this.authService.validateUserById(userData.email, userData.id);
                client.user = user
                return next();
            }
        } catch (error) {
            return next(new WsException('Unauthorized'));
        }
    }

    validateEvent = async (client: CustomSocket): Promise<any> => {
        return async (event: [string, any], next: (error?: Error) => void) => {
            try {
                this.logger.debug(`Supported event ${JSON.stringify(event)}}`);
                if (event[0] === 'stream-room-messages' || event[0] === 'typing') {
                    return next();
                } else {
                    this.logger.debug('Unsupported event');
                    return client.disconnect(true);
                }
            } catch (error) {
                this.logger.debug(`error ${error}`);
                return client.disconnect(true);
            }
        }
    }
}
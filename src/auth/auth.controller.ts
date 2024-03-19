import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public } from "./decorators/public.decorator";
import { RegisterRequestDto } from "./dtos/register-request.dto";
import { AccessTokenEntity } from "./entities/access-token.entity";

@Public()
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() register: RegisterRequestDto): Promise<AccessTokenEntity> {
        return this.authService.login(register);
    }

    @Post('register')
    async register(@Body() register: RegisterRequestDto): Promise<AccessTokenEntity> {
        return this.authService.register(register);
    }
}
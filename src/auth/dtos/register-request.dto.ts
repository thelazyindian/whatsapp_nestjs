import { IsEmail, IsString, IsStrongPassword } from "class-validator";

export class RegisterRequestDto {
    name?: string;
    image?: string;
    @IsEmail()
    email: string;
    @IsStrongPassword()
    password: string;
}
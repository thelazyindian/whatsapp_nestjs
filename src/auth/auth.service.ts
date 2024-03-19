import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { RegisterRequestDto } from './dtos/register-request.dto';
import { User } from '@prisma/client';
import { AccessTokenEntity } from './entities/access-token.entity';
import { UserEntity } from 'src/users/entities/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<User> {
    const user: User = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const isMatch: boolean = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Password does not match');
    }
    return user;
  }

  async validateUserById(email: string, id: string): Promise<User> {
    const user: User = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const isMatch: boolean = user.id === id;
    if (!isMatch) {
      throw new BadRequestException('User does not match');
    }
    return user;
  }

  async createToken(user: UserEntity): Promise<AccessTokenEntity> {
    const payload = { email: user.email, id: user.id };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async register(user: RegisterRequestDto): Promise<AccessTokenEntity> {
    const existingUser = await this.usersService.findOneByEmail(user.email);
    if (existingUser) {
      throw new BadRequestException('email already exists');
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser: RegisterRequestDto = { ...user, password: hashedPassword };
    const userProfile = await this.usersService.setProfile(newUser);
    return this.createToken(userProfile);
  }

  async login(user: RegisterRequestDto): Promise<AccessTokenEntity> {
    const userProfile = await this.validateUser(user.email, user.password);
    return this.createToken(userProfile);
  }
}
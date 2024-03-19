import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Activity, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from './entities/users.entity';
import { RegisterRequestDto } from 'src/auth/dtos/register-request.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async findOneByEmail(email: string): Promise<User | undefined> {
    try {
      return await this.prisma.user.findFirstOrThrow({
        where: {
          email
        }
      });
    } catch (e) {
      return;
    }
  }

  async setProfile(user: RegisterRequestDto): Promise<UserEntity> {
    try {
      const { id, name, image, email, phone, activity } = await this.prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          image: user.image,
          password: user.password,
          activity: Activity.ONLINE,
        }
      });

      return {
        id, name, image, email, phone, activity
      }
    } catch (e) {
      throw new HttpException('Some Error', HttpStatus.BAD_REQUEST);
    }
  }

  async updateProfile(userId: string, profile: UpdateProfileDto): Promise<UserEntity> {
    try {
      const { id, name, image, email, phone, activity } = await this.prisma.user.update({
        where: {
          id: userId
        },
        data: {
          name: profile.name,
          image: profile.image,
          activity: profile.activity,
        }
      });

      return {
        id, name, image, email, phone, activity
      }
    } catch (e) {
      throw new HttpException('Some Error', HttpStatus.BAD_REQUEST);
    }
  }

  async getProfile(userId: string): Promise<UserEntity> {
    try {
      const { id, name, image, email, phone, activity } = await this.prisma.user.findFirstOrThrow({
        where: {
          id: userId
        }
      });

      return {
        id, name, image, email, phone, activity
      }
    } catch (e) {
      throw new HttpException('Some Error', HttpStatus.BAD_REQUEST);
    }
  }
}

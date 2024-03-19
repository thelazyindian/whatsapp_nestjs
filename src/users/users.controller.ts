import { Body, Controller, Get, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from './entities/users.entity';
import { User } from 'src/auth/decorators/user.decorator';
import { UpdateProfileDto } from './dtos/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('getProfile')
  async getProfile(@User() user): Promise<UserEntity> {
    return this.userService.getProfile(user.id);
  }

  @Put('updateProfile')
  async updateProfile(@User() user, @Body() profile: UpdateProfileDto): Promise<UserEntity> {
    return this.userService.updateProfile(user.id, profile);
  }
}

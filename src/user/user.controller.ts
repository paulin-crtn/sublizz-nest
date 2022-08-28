import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { AccessJwtGuard } from 'src/auth/guard';

@Controller('users')
export class UserController {
  @UseGuards(AccessJwtGuard)
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }
}

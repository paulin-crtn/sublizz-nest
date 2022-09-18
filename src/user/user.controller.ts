import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { AccessJwtGuard } from '../auth/guard';
import { GetUser } from './decorator';
import { UpdateUserDto } from './dto';
import { UserEntity } from './entity';
import { UserService } from './user.service';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AccessJwtGuard)
  @Get('me')
  getMe(@GetUser() user: User) {
    return new UserEntity(user);
  }

  @UseGuards(AccessJwtGuard)
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return new UserEntity(await this.userService.update(id, userId, dto));
  }

  @UseGuards(AccessJwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async delete(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.userService.delete(id, userId);
  }
}

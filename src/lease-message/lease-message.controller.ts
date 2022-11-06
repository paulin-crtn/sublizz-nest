/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { AccessJwtGuard } from '../auth/guard';
import { LeaseEntity } from '../lease/entity';
import { GetUser } from '../user/decorator';
import { LeaseMessageDto } from './dto';
import { LeaseMessageService } from './lease-message.service';

/* -------------------------------------------------------------------------- */
/*                                 CONTROLLER                                 */
/* -------------------------------------------------------------------------- */
@ApiTags('lease-messages')
@Controller('lease-messages')
@UseInterceptors(ClassSerializerInterceptor)
export class LeaseMessageController {
  constructor(private leaseMessageService: LeaseMessageService) {}

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Get('user')
  async getUserMessages(@GetUser('id') userId: number) {
    const leases = await this.leaseMessageService.getUserMessages(userId);
    return leases.map((lease) => new LeaseEntity(lease as unknown));
  }

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async storeMessage(@GetUser() fromUser: User, @Body() dto: LeaseMessageDto) {
    await this.leaseMessageService.store(fromUser, dto);
    return { statusCode: 201, message: 'Lease message sent' };
  }
}

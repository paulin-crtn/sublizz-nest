/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
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
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessJwtGuard } from '../auth/guard';
import { GetUser } from '../user/decorator';
import { LeaseDto } from './dto';
import { LeaseEntity, MANY_LEASES, ONE_LEASE } from './entity';
import { LeaseService } from './lease.service';

/* -------------------------------------------------------------------------- */
/*                                 CONTROLLER                                 */
/* -------------------------------------------------------------------------- */
@ApiTags('leases')
@Controller('leases')
@UseInterceptors(ClassSerializerInterceptor)
export class LeaseController {
  constructor(private leaseService: LeaseService) {}
  @HttpCode(HttpStatus.OK)
  @Get()
  @SerializeOptions({
    groups: [MANY_LEASES],
  })
  async getLeases() {
    const leases = await this.leaseService.getLeases();
    return leases.map((lease) => new LeaseEntity(lease));
  }

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Get('user')
  @SerializeOptions({
    groups: [MANY_LEASES],
  })
  async getUserLeases(@GetUser('id') userId: number) {
    const userLeases = await this.leaseService.getUserLeases(userId);
    return userLeases.map((lease) => new LeaseEntity(lease));
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @SerializeOptions({
    groups: [ONE_LEASE],
  })
  async getLease(@Param('id', ParseIntPipe) id: number) {
    return new LeaseEntity(await this.leaseService.getLease(id));
  }

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @SerializeOptions({
    groups: [ONE_LEASE],
  })
  async store(@GetUser('id') userId: number, @Body() dto: LeaseDto) {
    return new LeaseEntity(await this.leaseService.store(userId, dto));
  }

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  @SerializeOptions({
    groups: [ONE_LEASE],
  })
  async update(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LeaseDto,
  ) {
    return new LeaseEntity(await this.leaseService.update(id, userId, dto));
  }

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async delete(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.leaseService.delete(id, userId);
  }
}

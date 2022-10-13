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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessJwtGuard } from '../auth/guard';
import { GetUser } from '../user/decorator';
import { LeaseDto } from './dto';
import { LeaseEntity, LeaseDetailsEntity } from './entity';
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
  async getLeases() {
    const leases = await this.leaseService.getLeases();
    return leases.map((lease) => new LeaseEntity(lease));
  }

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Get('user')
  async getUserLeases(@GetUser('id') userId: number) {
    const leases = await this.leaseService.getUserLeases(userId);
    return leases.map((lease) => new LeaseEntity(lease));
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getLease(@Param('id', ParseIntPipe) id: number) {
    const lease = await this.leaseService.getLease(id);
    return new LeaseDetailsEntity(lease);
  }

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async store(@GetUser('id') userId: number, @Body() dto: LeaseDto) {
    const lease = await this.leaseService.store(userId, dto);
    return new LeaseDetailsEntity(lease);
  }

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LeaseDto,
  ) {
    const lease = await this.leaseService.update(id, userId, dto);
    return new LeaseDetailsEntity(lease);
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

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('report/:leaseId')
  async report(
    @GetUser('id') userId: number,
    @Param('leaseId', ParseIntPipe) leaseId: number,
  ) {
    return await this.leaseService.report(leaseId, userId);
  }
}

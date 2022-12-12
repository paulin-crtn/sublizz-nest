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
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessJwtGuard } from '../auth/guard';
import { GetUser } from '../user/decorator';
import { GetLeasesDto, StoreUpdateLeaseDto } from './dto';
import { LeaseEntity, LeaseDetailsEntity } from './entity';
import { ILeasesWithCount } from './interfaces/ILeasesWithCount';
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
  async getLeases(@Query() queryParams: GetLeasesDto) {
    const { city, latitudes, longitudes, page } = queryParams;

    let data: undefined | ILeasesWithCount;

    if (city) {
      data = await this.leaseService.getLeasesFromCity(city, page);
    } else if (latitudes && longitudes) {
      data = await this.leaseService.getLeasesFromCoordinates(
        latitudes,
        longitudes,
      );
    } else {
      data = await this.leaseService.getLeases(page);
    }

    return {
      totalCount: data.totalCount,
      leases: data.leases.map((lease) => new LeaseEntity(lease as unknown)),
      ...(data.cityCoordinates
        ? { cityCoordinates: data.cityCoordinates }
        : {}),
    };
  }

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Get('user')
  async getUserLeases(@GetUser('id') userId: number) {
    const leases = await this.leaseService.getUserLeases(userId);
    return leases.map((lease) => new LeaseDetailsEntity(lease as unknown));
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getLease(@Param('id', ParseIntPipe) id: number) {
    const lease = await this.leaseService.getLease(id);
    return new LeaseDetailsEntity(lease as unknown);
  }

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async store(@GetUser('id') userId: number, @Body() dto: StoreUpdateLeaseDto) {
    const lease = await this.leaseService.store(userId, dto);
    return new LeaseDetailsEntity(lease as unknown);
  }

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: StoreUpdateLeaseDto,
  ) {
    const lease = await this.leaseService.update(id, userId, dto);
    return new LeaseDetailsEntity(lease as unknown);
  }

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async delete(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.leaseService.delete(id, userId);
    return { statusCode: 200, message: 'Lease deleted' };
  }
}

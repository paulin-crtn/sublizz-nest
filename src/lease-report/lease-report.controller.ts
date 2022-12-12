/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessJwtGuard } from '../auth/guard';
import { GetUser } from '../user/decorator';
import { LeaseReportDto } from './dto';
import { LeaseReportService } from './lease-report.service';

/* -------------------------------------------------------------------------- */
/*                                 CONTROLLER                                 */
/* -------------------------------------------------------------------------- */
@ApiTags('lease-reports')
@Controller('lease-reports')
export class LeaseReportController {
  constructor(private leaseReportService: LeaseReportService) {}

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post()
  async report(@GetUser('id') userId: number, @Body() dto: LeaseReportDto) {
    await this.leaseReportService.sendReport(userId, dto);
    return { statusCode: 200, message: 'Lease report sent' };
  }
}

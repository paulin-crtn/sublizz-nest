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
import { HelpUsDto } from './dto';
import { HelpUsService } from './help-us.service';

/* -------------------------------------------------------------------------- */
/*                                 CONTROLLER                                 */
/* -------------------------------------------------------------------------- */
@ApiTags('help-us')
@Controller('help-us')
export class HelpUsController {
  constructor(private helpUsService: HelpUsService) {}

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post()
  async help(@GetUser('id') userId: number, @Body() dto: HelpUsDto) {
    await this.helpUsService.sendHelpMessage(userId, dto.message);
    return { statusCode: 200, message: 'Message sent' };
  }
}

/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessJwtGuard } from '../auth/guard';
import { GetUser } from '../user/decorator';
import { ConversationService } from './conversation.service';
import { StoreConversationDto } from './dto';

/* -------------------------------------------------------------------------- */
/*                                 CONTROLLER                                 */
/* -------------------------------------------------------------------------- */
@Controller('conversation')
@ApiTags('conversation')
@UseInterceptors(ClassSerializerInterceptor)
export class ConversationController {
  constructor(private conversationService: ConversationService) {}

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async generateConversationId(
    @GetUser('id') fromUserId: number,
    @Body() dto: StoreConversationDto,
  ) {
    return await this.conversationService.generateConversationId(
      dto.leaseId,
      fromUserId,
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessJwtGuard } from '../auth/guard';
import { GetUser } from '../user/decorator';
import { ConversationMessageService } from './conversation-message.service';
import { StoreConversationMessageDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

/* -------------------------------------------------------------------------- */
/*                                 CONTROLLER                                 */
/* -------------------------------------------------------------------------- */
@ApiTags('conversation-message')
@Controller('conversation-message')
@UseInterceptors(ClassSerializerInterceptor)
export class ConversationMessageController {
  constructor(
    private prismaService: PrismaService,
    private conversationMessageService: ConversationMessageService,
  ) {}

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Get()
  async index(@GetUser('id') userId: number) {
    const userMessages = await this.conversationMessageService.getUserMessages(
      userId,
    );
    const dictionary = {};
    for await (const message of userMessages) {
      if (!dictionary[message.conversationId]) {
        const lease = await this.prismaService.lease.findUnique({
          where: { id: message.leaseId },
        });
        const { leaseId, ...data } = message;
        dictionary[message.conversationId] = {
          id: message.conversationId,
          lease,
          messages: [data],
        };
      } else {
        dictionary[message.conversationId].messages.push(message);
      }
    }
    return Object.values(dictionary);
  }

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async storeMessage(
    @GetUser('id') fromUserId: number,
    @Body() dto: StoreConversationMessageDto,
  ) {
    return await this.conversationMessageService.storeMessage(fromUserId, dto);
  }
}

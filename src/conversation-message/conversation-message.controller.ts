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
    const conversationsMessages =
      await this.conversationMessageService.getUserMessages(userId);
    const dictionary = {};
    for (const conversationMessages of conversationsMessages) {
      if (!dictionary[conversationMessages.conversationId]) {
        const { conversationId, fromUserId, conversation, ...message } =
          conversationMessages;
        dictionary[conversationMessages.conversationId] = {
          id: conversationMessages.conversationId,
          lease: conversationMessages.conversation.lease,
          messages: [{ ...message, fromUser: message.user }],
        };
      } else {
        const { conversationId, fromUserId, conversation, ...message } =
          conversationMessages;
        dictionary[conversationMessages.conversationId].messages.push({
          ...message,
          fromUser: message.user,
        });
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

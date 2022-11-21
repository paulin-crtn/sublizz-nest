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
    for (const message of conversationsMessages) {
      message['fromUser'] = message['user'];
      delete message['user'];
      if (!dictionary[message.conversation.id]) {
        dictionary[message.conversation.id] = {
          id: message.conversation.id,
          lease: message.conversation.lease,
          messages: [message],
        };
      } else {
        dictionary[message.conversation.id].messages.push(message);
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
    const message = await this.conversationMessageService.storeMessage(
      fromUserId,
      dto,
    );
    message['fromUser'] = message['user'];
    delete message['user'];
    return message;
  }
}

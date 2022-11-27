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
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { AccessJwtGuard } from '../auth/guard';
import { ConversationMessageService } from '../conversation-message/conversation-message.service';
import { MailService } from '../mail/mail.service';
import { GetUser } from '../user/decorator';
import { ConversationService } from './conversation.service';
import { StoreConversationDto } from './dto';

/* -------------------------------------------------------------------------- */
/*                                 CONTROLLER                                 */
/* -------------------------------------------------------------------------- */
@Controller('conversations')
@ApiTags('conversations')
@UseInterceptors(ClassSerializerInterceptor)
export class ConversationController {
  constructor(
    private conversationService: ConversationService,
    private conversationMessageService: ConversationMessageService,
    private mailService: MailService,
  ) {}

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async storeConversation(
    @GetUser() fromUser: User,
    @Body() dto: StoreConversationDto,
  ) {
    const { leaseId, message } = dto;
    // Store conversation
    const conversationId = await this.conversationService.storeConversation(
      fromUser.id,
      leaseId,
      message,
    );
    // Store message
    const { lease, toUser, conversationMessage } =
      await this.conversationMessageService.storeMessage(
        fromUser.id,
        conversationId,
        message,
      );
    // Send email to receiver
    await this.mailService.sendUserLeaseMessage(
      lease,
      fromUser,
      toUser,
      message,
    );
    // Return created message
    return conversationMessage;
  }

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Get('unread')
  async getUnreadConversations(@GetUser('id') userId: number) {
    const unreadConversation =
      await this.conversationService.getUnreadConversations(userId);
    return unreadConversation.reduce(
      (prev, curr) => [...prev, curr.message.conversationId],
      [],
    );
  }

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('set-as-read/:conversationId')
  async setConversationAsRead(
    @GetUser('id') userId: number,
    @Param('conversationId') conversationId: string,
  ) {
    return await this.conversationService.setConversationAsRead(
      userId,
      conversationId,
    );
  }
}

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
import { MailService } from '../mail/mail.service';
import { User } from '@prisma/client';
import { LeaseDetailsEntity } from '../lease/entity';

/* -------------------------------------------------------------------------- */
/*                                 CONTROLLER                                 */
/* -------------------------------------------------------------------------- */
@ApiTags('conversation-messages')
@Controller('conversation-messages')
@UseInterceptors(ClassSerializerInterceptor)
export class ConversationMessageController {
  constructor(
    private conversationMessageService: ConversationMessageService,
    private mailService: MailService,
  ) {}

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Get()
  async index(@GetUser('id') userId: number) {
    const conversations = await this.conversationMessageService.getUserMessages(
      userId,
    );
    return conversations.map((conversation: any) => {
      const { id, conversationParticipants, conversationMessages, lease } =
        conversation;
      return {
        id,
        participants: conversationParticipants.map(
          (participant: any) => participant.user,
        ),
        messages: conversationMessages,
        lease: new LeaseDetailsEntity(lease as unknown),
      };
    });
  }

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async storeMessage(
    @GetUser() fromUser: User,
    @Body() dto: StoreConversationMessageDto,
  ) {
    const { conversationId, message } = dto;
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
    // Return
    return { statusCode: 201, message: 'Message created' };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get('DATABASE_URL'),
        },
      },
    });
  }

  async cleanDb() {
    try {
      return await this.$transaction([
        this.passwordReset.deleteMany(),
        this.emailVerification.deleteMany(),
        this.leaseImage.deleteMany(),
        this.leaseFavorite.deleteMany(),
        this.lease.deleteMany(),
        this.conversationMessage.deleteMany(),
        this.conversation.deleteMany(),
        this.user.deleteMany(),
      ]);
    } catch (e) {
      throw new Error('An error occured while cleaning the DB: ' + e);
    }
  }
}

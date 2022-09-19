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

  cleanDb() {
    return this.$transaction([
      this.passwordReset.deleteMany(),
      this.emailVerification.deleteMany(),
      this.leaseImage.deleteMany(),
      this.lease.deleteMany(),
      this.user.deleteMany(),
    ]);
  }
}

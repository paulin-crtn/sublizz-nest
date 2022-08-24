import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: 'postgresql://postgres:eefVK@B7GKyC8BD@db.unnpkjktcopeemblwjer.supabase.co:5432/postgres',
        },
      },
    });
  }
}

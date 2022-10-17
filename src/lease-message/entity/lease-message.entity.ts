import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class LeaseMessageEntity {
  constructor(partial: Partial<LeaseMessageEntity>) {
    Object.assign(this, partial);
  }

  id: number;

  @ApiHideProperty()
  @Exclude()
  leaseId: number;

  @ApiHideProperty()
  @Exclude()
  fromUserId: number;

  content: string;
  createdAt: Date;
}

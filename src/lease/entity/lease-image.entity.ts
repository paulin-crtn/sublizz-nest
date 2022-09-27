import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class LeaseImageEntity {
  constructor(partial: Partial<LeaseImageEntity>) {
    Object.assign(this, partial);
  }

  id: number;
  leaseId: number;
  url: string;

  @ApiHideProperty()
  @Exclude()
  createdAt: Date;

  @ApiHideProperty()
  @Exclude()
  updatedAt: Date;
}

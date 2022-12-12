/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { LeaseEntity } from '../../lease/entity';

/* -------------------------------------------------------------------------- */
/*                                    CLASS                                   */
/* -------------------------------------------------------------------------- */
export class LeaseFavoriteEntity {
  constructor(partial: Partial<LeaseFavoriteEntity>) {
    Object.assign(this, partial);
  }

  id: number;

  @Exclude()
  @ApiHideProperty()
  leaseId: number;

  createdAt: Date;

  @Type(() => LeaseEntity)
  lease?: LeaseEntity[];
}

/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import { Expose, Type } from 'class-transformer';
import { LeaseImageEntity } from './index';

/* -------------------------------------------------------------------------- */
/*                                  CONSTANT                                  */
/* -------------------------------------------------------------------------- */
export const ONE_LEASE = 'lease_with_details';
export const MANY_LEASES = 'leases_without_details';

/* -------------------------------------------------------------------------- */
/*                                    CLASS                                   */
/* -------------------------------------------------------------------------- */
export class LeaseEntity {
  constructor(partial: Partial<LeaseEntity>) {
    Object.assign(this, partial);
  }

  @Expose({ groups: [ONE_LEASE, MANY_LEASES] })
  id: number;

  @Expose({ groups: [ONE_LEASE] })
  userId: number;

  @Expose({ groups: [ONE_LEASE] })
  houseNumber: string;

  @Expose({ groups: [ONE_LEASE] })
  street: string;

  @Expose({ groups: [ONE_LEASE, MANY_LEASES] })
  postCode: string;

  @Expose({ groups: [ONE_LEASE, MANY_LEASES] })
  city: string;

  @Expose({ groups: [ONE_LEASE, MANY_LEASES] })
  gpsLatitude: string;

  @Expose({ groups: [ONE_LEASE, MANY_LEASES] })
  gpsLongitude: string;

  @Expose({ groups: [ONE_LEASE] })
  description: string;

  @Expose({ groups: [ONE_LEASE, MANY_LEASES] })
  surface: number;

  @Expose({ groups: [ONE_LEASE, MANY_LEASES] })
  room: number;

  @Expose({ groups: [ONE_LEASE, MANY_LEASES] })
  startDate: Date;

  @Expose({ groups: [ONE_LEASE, MANY_LEASES] })
  endDate: Date;

  @Expose({ groups: [ONE_LEASE, MANY_LEASES] })
  isDateFlexible: number;

  @Expose({ groups: [ONE_LEASE, MANY_LEASES] })
  pricePerMonth: number;

  @Expose({ groups: [ONE_LEASE] })
  isPublished: number;

  @Expose({ groups: [ONE_LEASE] })
  createdAt: Date;

  @Expose({ groups: [ONE_LEASE] })
  updatedAt: Date;

  @Type(() => LeaseImageEntity)
  leaseImages: LeaseImageEntity[];
}

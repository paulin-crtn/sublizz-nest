/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import { ApiHideProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime';
import { Exclude, Transform, Type } from 'class-transformer';
import { LeaseTypeEnum } from '../enum';
import { LeaseImageEntity } from './index';

/* -------------------------------------------------------------------------- */
/*                                    CLASS                                   */
/* -------------------------------------------------------------------------- */
/**
 * There is another approach consisting to use
 * only one entity class.
 *
 * @Expose({ groups: [GROUP_1, GROUP_2] }) - in entity
 * @SerializeOptions({ groups: [GROUP_1]}) - in controller
 *
 * See https://gregornovak.eu/nestjs-response-groups-serialization
 *
 * But it doesn't work well with Swagger.
 */
export class LeaseDetailsEntity {
  constructor(partial: Partial<LeaseDetailsEntity>) {
    Object.assign(this, partial);
  }

  id: number;

  @Exclude()
  @ApiHideProperty()
  userId: number;

  type: LeaseTypeEnum;
  street: string;
  postCode: string;
  city: string;

  @Transform(({ value }: { value: Decimal }) => new Decimal(value).toNumber())
  gpsLatitude?: number;

  @Transform(({ value }: { value: Decimal }) => new Decimal(value).toNumber())
  gpsLongitude?: number;

  description?: string;
  surface: number;
  room: number;
  startDate: Date;
  endDate: Date;
  isDateFlexible: number;
  pricePerMonth: number;
  isPublished: number;
  createdAt: Date;
  updatedAt: Date;
  leaseImages: string[];

  user: {
    id: number;
    firstName: string;
    lastName: string;
    profilePictureName: string;
  };
}

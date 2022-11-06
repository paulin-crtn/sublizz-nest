/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import { ApiHideProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime';
import { Exclude, Transform, Type } from 'class-transformer';
import { LeaseMessageEntity } from '../../lease-message/entity';
import { LeaseTypeEnum } from '../enum';
import { ILeaseImage } from '../interfaces/ILeaseImage';

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
export class LeaseEntity {
  constructor(partial: Partial<LeaseEntity>) {
    Object.assign(this, partial);
  }

  id: number;

  @Exclude()
  @ApiHideProperty()
  userId: number;

  type: LeaseTypeEnum;

  @Exclude()
  @ApiHideProperty()
  street: string;

  postCode: string;
  city: string;

  @Transform(({ value }) => new Decimal(value).toNumber())
  gpsLatitude: number;

  @Transform(({ value }) => new Decimal(value).toNumber())
  gpsLongitude: number;

  @Exclude()
  @ApiHideProperty()
  description?: string;

  surface: number;
  room: number;
  startDate: Date;
  endDate: Date;
  isDateFlexible: number;
  pricePerMonth: number;

  @Exclude()
  @ApiHideProperty()
  isPublished: number;

  createdAt: Date;
  updatedAt: Date;

  @Transform(({ value }) =>
    value.map((leaseImage: ILeaseImage) => leaseImage.name),
  )
  leaseImages: string[];

  @Type(() => LeaseMessageEntity)
  leaseMessages?: LeaseMessageEntity[];
}

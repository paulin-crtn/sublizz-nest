/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
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
  houseNumber?: string;
  street: string;
  postCode: string;
  city: string;
  gpsLatitude?: number;
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

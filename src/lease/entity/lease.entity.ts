import { Type } from 'class-transformer';
import { LeaseImageEntity } from '.';

export class LeaseEntity {
  constructor(partial: Partial<LeaseEntity>) {
    Object.assign(this, partial);
  }

  id: number;
  userId: number;
  houseNumber: string;
  street: string;
  postCode: string;
  city: string;
  gpsLatitude: string;
  gpsLongitude: string;
  description: string;
  surface: number;
  room: number;
  startDate: Date;
  endDate: Date;
  isDateFlexible: number;
  createdAt: Date;
  updatedAt: Date;

  @Type(() => LeaseImageEntity)
  leaseImages: LeaseImageEntity[];
}

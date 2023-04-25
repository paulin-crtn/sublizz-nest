import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { LeaseTypeEnum } from '../enum';

export class StoreUpdateLeaseDto {
  @IsEnum(LeaseTypeEnum)
  type: string;

  @IsString()
  @Length(3, 30)
  street: string;

  @IsNumberString()
  @Length(5, 5)
  postCode: string;

  @IsString()
  @Length(3, 40)
  city: string;

  @IsLatitude()
  gpsLatitude: number;

  @IsLongitude()
  gpsLongitude: number;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(10)
  @Max(200)
  surface: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  room: number;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @Type(() => Number)
  @Min(0)
  @Max(1)
  isDateFlexible: number;

  @Type(() => Number)
  @IsNumber()
  @Min(200)
  @Max(2000)
  pricePerMonth: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  isPublished: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  leaseImages: string[];
}

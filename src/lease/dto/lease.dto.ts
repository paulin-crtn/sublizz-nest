import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
} from 'class-validator';
import { LeaseTypeEnum } from '../enum';

export class LeaseDto {
  @IsEnum(LeaseTypeEnum)
  type: string;

  @IsOptional()
  @IsString()
  @Length(1, 7)
  houseNumber?: string;

  @IsString()
  @Length(3, 30)
  street: string;

  @IsNumberString()
  @Length(5, 5)
  postCode: string;

  @IsString()
  @Length(3, 30)
  city: string;

  @IsOptional()
  @IsNumberString()
  @Length(1, 15)
  gpsLatitude?: string;

  @IsOptional()
  @IsNumberString()
  @Length(1, 15)
  gpsLongitude?: string;

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
  @IsUrl(undefined, { each: true })
  leaseImages: string[];
}

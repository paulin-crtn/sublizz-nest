import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
} from 'class-validator';

export class LeaseDto {
  @IsOptional()
  @IsString()
  @Length(1, 7)
  houseNumber: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 30)
  street: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(5, 5)
  postCode: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 30)
  city: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(10)
  @Max(200)
  surface: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  room: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  isDateFlexible: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(200)
  @Max(2000)
  pricePerMonth: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  isPublished: number;

  @IsArray()
  @IsUrl(undefined, { each: true })
  leaseImages: string[];
}

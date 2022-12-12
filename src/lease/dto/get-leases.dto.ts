import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetLeasesDto {
  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  latitudes: string;

  @IsOptional()
  @IsString()
  longitudes: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page: number;
}

import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class StoreLeaseFavoriteDto {
  @Type(() => Number)
  @IsNumber()
  leaseId: number;
}

import {
  IsString,
  Length,
  IsEmail,
  IsOptional,
  MaxLength,
  IsNumberString,
  IsEnum,
} from 'class-validator';
import { UserRoleEnum } from '../enum';

export class UpdateUserDto {
  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;

  @IsString()
  @Length(3, 30)
  firstName: string;

  @IsOptional()
  @IsString()
  @Length(3, 30)
  lastName?: string;

  @IsOptional()
  @IsNumberString()
  @Length(10, 10)
  phoneNumber?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Length(8, 20)
  password?: string;

  @IsOptional()
  @IsString()
  profilePictureName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  standardMessage?: string;
}

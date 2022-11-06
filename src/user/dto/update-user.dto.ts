import {
  IsString,
  Length,
  IsEmail,
  IsOptional,
  MaxLength,
  ValidateIf,
  IsNumberString,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @Length(3, 30)
  firstName: string;

  @ValidateIf((user) => user.lastName !== '')
  @IsOptional()
  @IsString()
  @Length(3, 30)
  lastName?: string;

  @ValidateIf((user) => user.phoneNumber !== '')
  @IsOptional()
  @IsNumberString()
  @Length(10, 10)
  phoneNumber?: string;

  @IsEmail()
  email: string;

  @ValidateIf((user) => user.password !== '')
  @IsOptional()
  @IsString()
  @Length(8, 20)
  password?: string;

  @ValidateIf((user) => user.profilePictureName !== null)
  @IsOptional()
  @IsString()
  profilePictureName?: string;

  @ValidateIf((user) => user.standardMessage !== '')
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  standardMessage?: string;
}

import {
  IsString,
  Length,
  IsEmail,
  IsOptional,
  MaxLength,
  ValidateIf,
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

  @IsEmail()
  email: string;

  @ValidateIf((user) => user.password !== '')
  @IsOptional()
  @IsString()
  @Length(8, 20)
  password?: string;

  @ValidateIf((user) => user.profilePictureName !== '')
  @IsOptional()
  @IsString()
  profilePictureName?: string;

  @ValidateIf((user) => user.standardMessage !== '')
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  standardMessage?: string;
}

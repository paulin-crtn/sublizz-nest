import { IsString, Length, IsEmail, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @Length(3, 30)
  firstName: string;

  @IsOptional()
  @IsString()
  @Length(3, 30)
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Length(8, 20)
  password: string;

  @IsOptional()
  @IsString()
  profilePictureUrl: string;
}

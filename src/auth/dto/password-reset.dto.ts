import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class PasswordResetDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(8, 20)
  password: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}

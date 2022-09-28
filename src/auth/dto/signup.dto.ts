import { IsEmail, IsString, Length } from 'class-validator';

export class SignUpDto {
  @IsString()
  @Length(3, 30)
  firstName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 20)
  password: string;
}

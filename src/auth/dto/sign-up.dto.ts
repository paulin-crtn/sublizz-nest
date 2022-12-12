import { IsEmail, IsEnum, IsString, Length } from 'class-validator';
import { UserRoleEnum } from '../../user/enum';

export class SignUpDto {
  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;

  @IsString()
  @Length(3, 30)
  firstName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 20)
  password: string;
}

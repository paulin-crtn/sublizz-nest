import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UserEntity {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureName: string;

  @ApiHideProperty()
  @Exclude()
  emailVerifiedAt: Date;

  @ApiHideProperty()
  @Exclude()
  passwordHash: string;

  @ApiHideProperty()
  @Exclude()
  refreshTokenHash: string;

  @ApiHideProperty()
  @Exclude()
  createdAt: Date;

  @ApiHideProperty()
  @Exclude()
  updatedAt: Date;
}

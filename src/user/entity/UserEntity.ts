import { Exclude } from 'class-transformer';

export class UserEntity {
  id: number;
  firstName: string;
  lastName: string;
  email: string;

  @Exclude()
  emailVerifiedAt: Date;

  @Exclude()
  passwordHash: string;

  @Exclude()
  refreshTokenHash: string;

  profilePictureUrl: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}

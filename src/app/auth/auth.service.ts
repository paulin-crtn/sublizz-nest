/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import validate from 'deep-email-validator';
import argon from 'argon2';
import randomToken from 'rand-token';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { PasswordResetDto, SignInDto, SignUpDto } from './dto';

/* -------------------------------------------------------------------------- */
/*                             AUTH SERVICE CLASS                             */
/* -------------------------------------------------------------------------- */
@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private userService: UserService,
    private mailService: MailService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                              PUBLIC FUNCTIONS                              */
  /* -------------------------------------------------------------------------- */

  /**
   * Sign up new user
   *
   * @param dto
   * @returns
   */
  async signUp(dto: SignUpDto): Promise<void> {
    // Validates email address based on regex, common typos,
    // disposable email blacklists, DNS records and SMTP server response.
    const res = await validate({
      email: dto.email,
      sender: dto.email,
      validateRegex: true,
      validateMx: true,
      validateTypo: true,
      validateDisposable: true,
      validateSMTP: false, // Timeout issue
    });
    if (!res.valid) {
      throw new BadRequestException("L'adresse email n'est pas valide.");
    }
    // Generate the password hash
    const passwordHash = await argon.hash(dto.password);
    try {
      // Save the new user in the db
      const user = await this.prismaService.user.create({
        data: {
          role: dto.role,
          firstName: dto.firstName,
          email: dto.email,
          passwordHash,
        },
      });
      // Verify the provided email belongs to the user
      await this.userService.verifyUserEmail(user, user.email);
    } catch (error) {
      // Catch unique constraint violation error
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException("L'adresse email est déjà utilisée.");
        }
      }
      throw error;
    }
  }

  /**
   * Sign in a user
   *
   * @param dto
   * @returns
   */
  async signIn(dto: SignInDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Find the user by email
    const user = await this.userService.getUserByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }
    // Compare password
    const isPasswordCorrect = await argon.verify(
      user.passwordHash,
      dto.password,
    );
    // If password incorrect throw exception
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Mot de passe incorrect.');
    }
    // Generate tokens
    const [accessToken, refreshToken] = await Promise.all([
      this._issueAccessToken(user.id),
      this._issueRefreshToken(user.id),
    ]);
    // Return tokens
    return { accessToken, refreshToken };
  }

  /**
   * Issue new tokens
   *
   * @param user
   * @returns
   */
  async refreshTokens(
    user: User,
  ): Promise<{ accessToken: string; newRefreshToken: string }> {
    // Generate new tokens
    const [accessToken, newRefreshToken] = await Promise.all([
      this._issueAccessToken(user.id),
      this._issueRefreshToken(user.id),
    ]);
    // Return new tokens
    return { accessToken, newRefreshToken };
  }

  /**
   * Log out a user
   *
   * @param userId
   */
  async logout(userId: number): Promise<void> {
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshTokenHash: null,
      },
    });
  }

  /**
   * Confirm user email
   *
   * @param emailVerificationId
   * @param token
   */
  async confirmUserEmail(
    emailVerificationId: number,
    token: string,
  ): Promise<{ email: string }> {
    // Find email verification
    const emailVerification =
      await this.prismaService.emailVerification.findUnique({
        where: {
          id: emailVerificationId,
        },
      });
    // If email verification does not exist throw exception
    if (!emailVerification) {
      throw new NotFoundException('Email déjà validé ou non trouvé.');
    }
    // Compare token
    const isTokenCorrect = await argon.verify(
      emailVerification.tokenHash,
      token,
    );
    // If token incorrect throw exception
    if (!isTokenCorrect) {
      throw new UnauthorizedException('Token invalide.');
    }
    // Update user
    const user = await this.prismaService.user.update({
      where: {
        id: emailVerification.userId,
      },
      data: {
        email: emailVerification.email,
        emailVerifiedAt: new Date(Date.now()),
      },
    });
    // Delete token
    await this.prismaService.emailVerification.delete({
      where: {
        id: emailVerificationId,
      },
    });
    // Return
    return { email: user.email };
  }

  /**
   * Issue password reset token
   *
   * @param email
   */
  async issuePasswordResetToken(email: string): Promise<void> {
    // Find the user by email
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }
    // Generate and store reset password token
    const token = randomToken.generate(16);
    const tokenHash = await argon.hash(token);
    await this.prismaService.passwordReset.create({
      data: {
        userEmail: email,
        tokenHash,
      },
    });
    // Send token to user's email
    await this.mailService.sendUserResetPassword(user, token);
  }

  /**
   * Reset user password
   *
   * @param dto
   */
  async resetUserPassword(dto: PasswordResetDto) {
    // Find PasswordReset
    const passwordReset = await this.prismaService.passwordReset.findFirst({
      where: {
        userEmail: dto.email,
      },
      orderBy: { createdAt: 'desc' },
    });
    // If PasswordReset does not exist throw exception
    if (!passwordReset) {
      throw new NotFoundException(
        'Aucune demande de réinitialisation de mot de passe trouvée.',
      );
    }
    // Compare token
    const isTokenCorrect = await argon.verify(
      passwordReset.tokenHash,
      dto.token,
    );
    // If token incorrect throw exception
    if (!isTokenCorrect) {
      throw new UnauthorizedException('Token incorrect.');
    }
    // If token expired throw exception
    const isExpired =
      passwordReset.createdAt < new Date(Date.now() - 15 * 60 * 1000); // 15 min
    if (isExpired) {
      await this.prismaService.passwordReset.delete({
        where: { id: passwordReset.id },
      });
      throw new UnauthorizedException('Le token a expiré.');
    }
    // Update user password
    const passwordHash = await argon.hash(dto.password);
    await this.prismaService.user.update({
      where: {
        email: dto.email,
      },
      data: {
        passwordHash,
      },
    });
    // Delete all user PasswordReset
    await this.prismaService.passwordReset.deleteMany({
      where: { userEmail: dto.email },
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                              PRIVATE FUNCTIONS                             */
  /* -------------------------------------------------------------------------- */
  /**
   * Issue an access token
   *
   * @param userId
   * @returns
   */
  private async _issueAccessToken(userId: number): Promise<string> {
    // Payload
    const payload = {
      sub: userId,
    };
    // JWT access token
    return await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: this.configService.get('ACCESS_JWT_SECRET'),
    });
  }

  /**
   * Issue a refresh token
   *
   * @param userId
   */
  private async _issueRefreshToken(userId: number): Promise<string> {
    // Generate the refresh token
    const refreshToken = randomToken.generate(32);
    const refreshTokenHash = await argon.hash(refreshToken);
    // Save the refresh token hash
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshTokenHash,
      },
    });
    // Payload
    const payload = {
      sub: userId,
      refreshToken,
    };
    // JWT refresh token
    return await this.jwtService.signAsync(payload, {
      expiresIn: '1w',
      secret: this.configService.get('REFRESH_JWT_SECRET'),
    });
  }
}

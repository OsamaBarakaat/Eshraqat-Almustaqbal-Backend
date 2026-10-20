import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../prisma/prisma.service";
import { LoginDto, RefreshTokenDto } from "./dto/auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }

    if (user.status !== "ACTIVE") {
      throw new UnauthorizedException("هذا الحساب موقوف أو غير نشط. يرجى التواصل مع الإدارة");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role.code);

    // Update refresh token & last active
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
        lastActiveAt: new Date(),
      },
    });

    // Strip passwordHash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, refreshToken: _, ...userProfile } = user;

    return {
      user: userProfile,
      tokens,
    };
  }

  async refreshTokens(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET", "eshraqat-almustaqbal-ultra-secure-refresh-token-secret-2026"),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException("رمز التحديث غير صالح");
      }

      const isMatch = await bcrypt.compare(dto.refreshToken, user.refreshToken);
      if (!isMatch) {
        throw new UnauthorizedException("رمز التحديث غير صالح أو تم إبطاله");
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role.code);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
        },
      });

      return tokens;
    } catch {
      throw new UnauthorizedException("رمز التحديث منتهي الصلاحية أو غير صالح");
    }
  }

  async confirmPassword(userId: string, passwordAttempt: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException("المستخدم غير موجود");
    }

    const isMatch = await bcrypt.compare(passwordAttempt, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException("كلمة المرور غير صحيحة");
    }

    return true;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException("المستخدم غير موجود");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, refreshToken, ...profile } = user;
    return profile;
  }

  private async generateTokens(userId: string, email: string, roleCode: string) {
    const payload = { sub: userId, email, roleCode };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("JWT_SECRET", "eshraqat-almustaqbal-ultra-secure-jwt-secret-key-2026"),
        expiresIn: this.configService.get<string>("JWT_EXPIRES_IN", "7d") as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET", "eshraqat-almustaqbal-ultra-secure-refresh-token-secret-2026"),
        expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRES_IN", "30d") as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    };
  }
}

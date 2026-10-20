import { Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto, RefreshTokenDto, ConfirmPasswordDto } from "./dto/auth.dto";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("المصادقة وتسجيل الدخول (Auth)")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "تسجيل الدخول إلى لوحة التحكم" })
  @ApiResponse({ status: 200, description: "تم تسجيل الدخول بنجاح مع استخراج رموز JWT وبيانات المستخدم" })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "تجديد رمز الدخول Refresh Token" })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("me")
  @ApiOperation({ summary: "جلب بيانات المستخدم الحالي وصلاحياته" })
  async getProfile(@CurrentUser("id") userId: string) {
    return this.authService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post("confirm-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "التحقق من كلمة المرور قبل العمليات الحساسة (مثل حذف عقار)" })
  async confirmPassword(
    @CurrentUser("id") userId: string,
    @Body() dto: ConfirmPasswordDto,
  ) {
    const verified = await this.authService.confirmPassword(userId, dto.password);
    return { verified, message: "تم التحقق من كلمة المرور بنجاح" };
  }
}

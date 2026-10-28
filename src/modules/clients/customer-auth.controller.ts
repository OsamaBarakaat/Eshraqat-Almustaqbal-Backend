import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CustomerAuthService } from "./customer-auth.service";
import {
  CustomerRegisterDto,
  CustomerLoginDto,
  CustomerForgotPasswordDto,
  CustomerResetPasswordDto,
} from "./dto/customer-auth.dto";
import { Public } from "../../common/decorators/public.decorator";

@ApiTags("Customer Website Authentication (عملاء الموقع)")
@Controller("clients/auth")
export class CustomerAuthController {
  constructor(private readonly customerAuthService: CustomerAuthService) {}

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "تسجيل حساب عميل جديد بالكامل بدون OTP" })
  @ApiResponse({ status: 201, description: "تم إنشاء الحساب بنجاح وإرجاع رمز JWT والبيانات" })
  register(@Body() dto: CustomerRegisterDto) {
    return this.customerAuthService.register(dto);
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "تسجيل دخول العميل بالبريد الإلكتروني أو رقم الجوال وكلمة المرور" })
  @ApiResponse({ status: 200, description: "تم تسجيل الدخول بنجاح" })
  login(@Body() dto: CustomerLoginDto) {
    return this.customerAuthService.login(dto);
  }

  @Public()
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "تقديم طلب استعادة كلمة المرور للمراجعة من الإدارة" })
  @ApiResponse({ status: 200, description: "تم تقديم الطلب بنجاح" })
  forgotPassword(@Body() dto: CustomerForgotPasswordDto) {
    return this.customerAuthService.requestPasswordRecovery(dto);
  }

  @Public()
  @Get("verify-reset-token")
  @ApiOperation({ summary: "التحقق من صحة رابط استعادة كلمة المرور المعتمد" })
  verifyResetToken(@Query("token") token: string) {
    return this.customerAuthService.verifyResetToken(token);
  }

  @Public()
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "تعيين كلمة المرور الجديدة باستخدام الرابط المعتمد" })
  resetPassword(@Body() dto: CustomerResetPasswordDto) {
    return this.customerAuthService.resetPassword(dto);
  }
}

import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "admin@eshraqat.sa", description: "البريد الإلكتروني" })
  @IsEmail({}, { message: "البريد الإلكتروني غير صالح" })
  @IsNotEmpty({ message: "البريد الإلكتروني مطلوب" })
  email: string;

  @ApiProperty({ example: "Eshraqat@2026", description: "كلمة المرور" })
  @IsString()
  @IsNotEmpty({ message: "كلمة المرور مطلوبة" })
  @MinLength(6, { message: "كلمة المرور يجب ألا تقل عن 6 أحرف" })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: "رمز التحديث Refresh Token" })
  @IsString()
  @IsNotEmpty({ message: "رمز التحديث مطلوب" })
  refreshToken: string;
}

export class ConfirmPasswordDto {
  @ApiProperty({ example: "Eshraqat@2026", description: "كلمة المرور لتأكيد العملية الحساسة" })
  @IsString()
  @IsNotEmpty({ message: "كلمة المرور مطلوبة للتأكيد" })
  password: string;
}

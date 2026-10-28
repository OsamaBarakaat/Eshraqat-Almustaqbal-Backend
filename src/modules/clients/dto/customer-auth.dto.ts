import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEmail, MinLength, IsOptional, IsEnum } from "class-validator";
import { PasswordRecoveryStatus } from "@prisma/client";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

export class CustomerRegisterDto {
  @ApiProperty({ example: "سعد" })
  @IsString({ message: "الاسم الأول يجب أن يكون نصاً" })
  @IsNotEmpty({ message: "الاسم الأول مطلوب" })
  firstName: string;

  @ApiProperty({ example: "القحطاني" })
  @IsString({ message: "اسم العائلة يجب أن يكون نصاً" })
  @IsNotEmpty({ message: "اسم العائلة مطلوب" })
  lastName: string;

  @ApiProperty({ example: "saad@example.com" })
  @IsEmail({}, { message: "يرجى إدخال بريد إلكتروني صحيح" })
  @IsNotEmpty({ message: "البريد الإلكتروني مطلوب" })
  email: string;

  @ApiProperty({ example: "الرياض" })
  @IsString({ message: "المنطقة / المدينة يجب أن تكون نصاً" })
  @IsNotEmpty({ message: "المنطقة أو المدينة مطلوبة" })
  region: string;

  @ApiProperty({
    example: "565642556",
    description: "رقم الجوال السعودي بدون مفتاح الدولة وبدون الصفر الأول",
  })
  @IsString({ message: "رقم الجوال يجب أن يكون نصاً" })
  @IsNotEmpty({ message: "رقم الجوال مطلوب" })
  phone: string;

  @ApiProperty({ example: "Secret123!", minLength: 6 })
  @IsString()
  @MinLength(6, { message: "كلمة المرور يجب ألا تقل عن 6 خانات" })
  password: string;

  @ApiProperty({ example: "Secret123!" })
  @IsString()
  @IsNotEmpty({ message: "تأكيد كلمة المرور مطلوب" })
  confirmPassword: string;
}

export class CustomerLoginDto {
  @ApiProperty({
    example: "saad@example.com",
    description: "البريد الإلكتروني أو رقم الجوال السعودي (مثل 565642556)",
  })
  @IsString({ message: "المعرّف (البريد الإلكتروني أو رقم الجوال) مطلوب" })
  @IsNotEmpty({ message: "يرجى إدخال البريد الإلكتروني أو رقم الجوال" })
  identifier: string;

  @ApiProperty({ example: "Secret123!" })
  @IsString()
  @IsNotEmpty({ message: "كلمة المرور مطلوبة" })
  password: string;
}

export class CustomerForgotPasswordDto {
  @ApiProperty({
    example: "saad@example.com",
    description: "البريد الإلكتروني المسجل أو رقم الجوال لاستعادة كلمة المرور",
  })
  @IsString()
  @IsNotEmpty({ message: "يرجى إدخال البريد الإلكتروني أو رقم الجوال المسجل" })
  identifier: string;
}

export class CustomerResetPasswordDto {
  @ApiProperty({ description: "رمز استعادة كلمة المرور المعتمد من الإدارة" })
  @IsString()
  @IsNotEmpty({ message: "رمز الاستعادة مطلوب" })
  token: string;

  @ApiProperty({ example: "NewSecret123!", minLength: 6 })
  @IsString()
  @MinLength(6, { message: "كلمة المرور الجديدة يجب ألا تقل عن 6 خانات" })
  password: string;

  @ApiProperty({ example: "NewSecret123!" })
  @IsString()
  @IsNotEmpty({ message: "تأكيد كلمة المرور الجديدة مطلوب" })
  confirmPassword: string;
}

export class ReviewRecoveryRequestDto {
  @ApiProperty({ enum: ["APPROVED", "REJECTED"], example: "APPROVED" })
  @IsEnum(["APPROVED", "REJECTED"], { message: "الحالة يجب أن تكون إما APPROVED أو REJECTED" })
  status: "APPROVED" | "REJECTED";

  @ApiPropertyOptional({ example: "تم التحقق من هوية العميل هاتفياً" })
  @IsString()
  @IsOptional()
  adminNotes?: string;
}

export class QueryRecoveryRequestsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: PasswordRecoveryStatus })
  @IsEnum(PasswordRecoveryStatus)
  @IsOptional()
  status?: PasswordRecoveryStatus;
}

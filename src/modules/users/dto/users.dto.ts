import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsEnum, MinLength } from "class-validator";
import { UserStatus } from "@prisma/client";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

export class CreateUserDto {
  @ApiProperty({ example: "أحمد بن عبد الله السبيعي" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "ahmed@eshraqat.sa" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "+966501234567" })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: "uuid-role-id" })
  @IsString()
  @IsNotEmpty()
  roleId: string;

  @ApiPropertyOptional({ example: "قطاع المبيعات" })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ example: "Eshraqat@2026" })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: "أحمد عبد الله" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: "ahmed@eshraqat.sa" })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: "+966501234567" })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: "uuid-role-id" })
  @IsString()
  @IsOptional()
  roleId?: string;

  @ApiPropertyOptional({ example: "قطاع المبيعات والتسويق" })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ example: "https://example.com/avatar.jpg" })
  @IsString()
  @IsOptional()
  avatar?: string;
}

export class UpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  @IsEnum(UserStatus)
  @IsNotEmpty()
  status: UserStatus;
}

export class ResetUserPasswordDto {
  @ApiProperty({ example: "NewSecurePassword@123" })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;
}

export class QueryUsersDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: "Filter by role ID" })
  @IsString()
  @IsOptional()
  roleId?: string;

  @ApiPropertyOptional({ enum: UserStatus, description: "Filter by status" })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}

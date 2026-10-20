import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ModuleType, ActionType, RoleCode } from "@prisma/client";

export class RolePermissionDto {
  @ApiProperty({ enum: ModuleType, description: "اسم الوحدة / القسم" })
  @IsEnum(ModuleType)
  module: ModuleType;

  @ApiProperty({ enum: ActionType, isArray: true, description: "قائمة الإجراءات المسموحة" })
  @IsArray()
  @IsEnum(ActionType, { each: true })
  actions: ActionType[];
}

export class CreateRoleDto {
  @ApiProperty({ example: "CUSTOM_AGENT", description: "كود الدور التعريفي" })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: "مشرف مبيعات أراضي", description: "المسمى الوظيفي بالعربية" })
  @IsString()
  @IsNotEmpty()
  titleArabic: string;

  @ApiProperty({ example: "مسؤول عن متابعة أراضي واستصلاح", description: "وصف الدور الوظيفي" })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ type: [RolePermissionDto], description: "مصفوفة الصلاحيات الممنوحة" })
  @IsArray()
  permissions: RolePermissionDto[];
}

export class UpdateRolePermissionsDto {
  @ApiPropertyOptional({ description: "المسمى الوظيفي بالعربية" })
  @IsString()
  @IsOptional()
  titleArabic?: string;

  @ApiPropertyOptional({ description: "وصف الدور" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: [RolePermissionDto], description: "مصفوفة الصلاحيات المحدثة" })
  @IsArray()
  permissions: RolePermissionDto[];
}

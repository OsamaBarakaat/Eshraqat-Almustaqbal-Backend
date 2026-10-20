import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsInt } from "class-validator";

export class CreateProvinceDto {
  @ApiProperty({ example: "منطقة الرياض" })
  @IsString()
  @IsNotEmpty()
  nameArabic: string;

  @ApiProperty({ example: "Riyadh Region" })
  @IsString()
  @IsNotEmpty()
  nameEnglish: string;

  @ApiPropertyOptional({ example: "المملكة العربية السعودية" })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateProvinceDto {
  @ApiPropertyOptional({ example: "منطقة الرياض" })
  @IsString()
  @IsOptional()
  nameArabic?: string;

  @ApiPropertyOptional({ example: "Riyadh Region" })
  @IsString()
  @IsOptional()
  nameEnglish?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class CreateCityDto {
  @ApiProperty({ example: "uuid-province-id" })
  @IsString()
  @IsNotEmpty()
  provinceId: string;

  @ApiProperty({ example: "مدينة الرياض" })
  @IsString()
  @IsNotEmpty()
  nameArabic: string;

  @ApiProperty({ example: "Riyadh City" })
  @IsString()
  @IsNotEmpty()
  nameEnglish: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateCityDto {
  @ApiPropertyOptional({ example: "مدينة الرياض" })
  @IsString()
  @IsOptional()
  nameArabic?: string;

  @ApiPropertyOptional({ example: "Riyadh City" })
  @IsString()
  @IsOptional()
  nameEnglish?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class CreateDistrictDto {
  @ApiProperty({ example: "uuid-city-id" })
  @IsString()
  @IsNotEmpty()
  cityId: string;

  @ApiProperty({ example: "حي النرجس" })
  @IsString()
  @IsNotEmpty()
  nameArabic: string;

  @ApiProperty({ example: "An Narjis" })
  @IsString()
  @IsNotEmpty()
  nameEnglish: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateDistrictDto {
  @ApiPropertyOptional({ example: "حي النرجس" })
  @IsString()
  @IsOptional()
  nameArabic?: string;

  @ApiPropertyOptional({ example: "An Narjis" })
  @IsString()
  @IsOptional()
  nameEnglish?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

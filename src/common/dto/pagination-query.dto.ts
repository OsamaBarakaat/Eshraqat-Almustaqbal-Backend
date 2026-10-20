import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: "رقم الصفحة" })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100, description: "عدد العناصر بالصفحة" })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize: number = 10;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100, description: "عدد العناصر بالصفحة (بديل pageSize)" })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: "كلمة البحث في العناوين والأكواد" })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ default: "createdAt", description: "حقل الترتيب" })
  @IsString()
  @IsOptional()
  sortBy: string = "createdAt";

  @ApiPropertyOptional({ default: "desc", enum: ["asc", "desc"], description: "اتجاه الترتيب" })
  @IsString()
  @IsOptional()
  sortOrder: "asc" | "desc" = "desc";
}

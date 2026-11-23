import { IsOptional, IsString, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class QueryMapInteractionsDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ description: "البحث باسم العميل أو رقم الجوال أو الإيميل أو اسم/عنوان العقار الوطني" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "تصفية حسب عقار محدد" })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiPropertyOptional({ description: "تصفية من تاريخ (YYYY-MM-DD)" })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: "تصفية إلى تاريخ (YYYY-MM-DD)" })
  @IsOptional()
  @IsString()
  dateTo?: string;
}

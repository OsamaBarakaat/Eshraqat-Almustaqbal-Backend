import { IsString, IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateMapInteractionDto {
  @ApiProperty({ description: "معرف العقار الذي تم النقر على خريطته" })
  @IsString()
  @IsNotEmpty({ message: "معرف العقار مطلوب" })
  propertyId: string;

  @ApiPropertyOptional({ description: "معرف العميل (اختياري إذا تم إرسال توكن المصادقة)" })
  @IsString()
  @IsOptional()
  clientId?: string;
}

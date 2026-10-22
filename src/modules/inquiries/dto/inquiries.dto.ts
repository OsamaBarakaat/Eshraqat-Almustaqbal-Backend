import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsEmail } from "class-validator";
import { InquiryStatus, InquiryType } from "@prisma/client";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

export class CreateInquiryDto {
  @ApiPropertyOptional({ example: "خالد المحمدي" })
  @IsString()
  @IsOptional()
  senderName?: string;

  @ApiPropertyOptional({ example: "خالد المحمدي" })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ example: "+966540001122" })
  @IsString()
  @IsOptional()
  senderPhone?: string;

  @ApiPropertyOptional({ example: "+966540001122" })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiPropertyOptional({ example: "khaled@example.com" })
  @IsOptional()
  @IsString()
  senderEmail?: string;

  @ApiPropertyOptional({ example: "khaled@example.com" })
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @ApiPropertyOptional({ enum: InquiryType, default: InquiryType.GENERAL_CONTACT })
  @IsEnum(InquiryType)
  @IsOptional()
  type?: InquiryType;

  @ApiPropertyOptional({ example: "uuid-property-id" })
  @IsString()
  @IsOptional()
  relatedPropertyId?: string;

  @ApiProperty({ example: "استفسار بخصوص فيلا النرجس" })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: "السلام عليكم، هل الفيلا تقبل التمويل العقاري المدعوم من سكني؟" })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class ReplyInquiryDto {
  @ApiProperty({ example: "تم التواصل هاتفياً مع العميل وتوضيح قبول العقار لكافة برامج سكني والتمويل البنكي." })
  @IsString()
  @IsNotEmpty()
  replyNotes: string;
}

export class UpdateInquiryStatusDto {
  @ApiProperty({ enum: InquiryStatus, example: InquiryStatus.IN_PROGRESS })
  @IsEnum(InquiryStatus)
  @IsNotEmpty()
  status: InquiryStatus;
}

export class AssignInquiryEmployeeDto {
  @ApiProperty({ example: "uuid-user-id" })
  @IsString()
  @IsNotEmpty()
  assignedEmployeeId: string;
}

export class QueryInquiriesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: InquiryStatus })
  @IsEnum(InquiryStatus)
  @IsOptional()
  status?: InquiryStatus;

  @ApiPropertyOptional({ enum: InquiryType })
  @IsEnum(InquiryType)
  @IsOptional()
  type?: InquiryType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  relatedPropertyId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  assignedEmployeeId?: string;
}

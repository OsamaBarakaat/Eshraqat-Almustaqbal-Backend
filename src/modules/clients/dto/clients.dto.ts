import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsEmail, IsNumber } from "class-validator";
import { LeadStatus, LeadSource, PropertyCategory, TimelineEventType } from "@prisma/client";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

export class CreateClientDto {
  @ApiProperty({ example: "سعد بن فهد القحطاني" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "+966551234567" })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: "saad@example.com" })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ enum: LeadStatus, default: LeadStatus.NEW })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @ApiPropertyOptional({ enum: LeadSource, default: LeadSource.WEBSITE_INQUIRY })
  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource;

  @ApiPropertyOptional({ example: 2000000 })
  @IsNumber()
  @IsOptional()
  budgetMin?: number;

  @ApiPropertyOptional({ example: 3500000 })
  @IsNumber()
  @IsOptional()
  budgetMax?: number;

  @ApiPropertyOptional({ enum: PropertyCategory, example: PropertyCategory.RESIDENTIAL })
  @IsEnum(PropertyCategory)
  @IsOptional()
  preferredCategory?: PropertyCategory;

  @ApiPropertyOptional({ example: "شمال الرياض - النرجس أو الياسمين" })
  @IsString()
  @IsOptional()
  preferredLocation?: string;

  @ApiPropertyOptional({ example: "uuid-property-id" })
  @IsString()
  @IsOptional()
  interestedPropertyId?: string;

  @ApiPropertyOptional({ example: "uuid-user-id" })
  @IsString()
  @IsOptional()
  assignedEmployeeId?: string;

  @ApiPropertyOptional({ example: "يبحث عن فيلا جاهزة للتسليم الفوري تمويل عقاري بنكي" })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateClientDto extends CreateClientDto {}

export class UpdateClientStatusDto {
  @ApiProperty({ enum: LeadStatus, example: LeadStatus.QUALIFIED })
  @IsEnum(LeadStatus)
  @IsNotEmpty()
  status: LeadStatus;

  @ApiPropertyOptional({ example: "تمت مراجعة القدرة الائتمانية والعميل مؤهل للشراء" })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class AddTimelineEventDto {
  @ApiProperty({ enum: TimelineEventType, example: TimelineEventType.CALL })
  @IsEnum(TimelineEventType)
  @IsNotEmpty()
  type: TimelineEventType;

  @ApiProperty({ example: "مكالمة هاتفية تمهيدية" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: "تم التواصل مع العميل لمناقشة عروض فلل النرجس وتم الاتفاق على موعد معاينة" })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class AssignClientEmployeeDto {
  @ApiProperty({ example: "uuid-user-id" })
  @IsString()
  @IsNotEmpty()
  assignedEmployeeId: string;
}

export class QueryClientsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: LeadStatus })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @ApiPropertyOptional({ enum: LeadSource })
  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource;

  @ApiPropertyOptional({ enum: PropertyCategory })
  @IsEnum(PropertyCategory)
  @IsOptional()
  preferredCategory?: PropertyCategory;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  assignedEmployeeId?: string;
}

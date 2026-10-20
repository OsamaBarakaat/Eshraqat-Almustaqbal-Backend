import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsEmail } from "class-validator";
import { AppointmentStatus } from "@prisma/client";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

export class CreateAppointmentDto {
  @ApiProperty({ example: "عبد الله الشمري" })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: "+966509876543" })
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @ApiPropertyOptional({ example: "client@example.com" })
  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @ApiProperty({ example: "uuid-property-id" })
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({ example: "2026-04-15" })
  @IsString()
  @IsNotEmpty()
  requestedDate: string; // YYYY-MM-DD

  @ApiProperty({ example: "16:30" })
  @IsString()
  @IsNotEmpty()
  requestedTime: string;

  @ApiPropertyOptional({ example: "أود معاينة الفيلا في المساء مع العائلة" })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateAppointmentStatusDto {
  @ApiProperty({ enum: AppointmentStatus, example: AppointmentStatus.CONFIRMED })
  @IsEnum(AppointmentStatus)
  @IsNotEmpty()
  status: AppointmentStatus;

  @ApiPropertyOptional({ example: "تم تأكيد الموعد وإبلاغ العميل هاتفياً" })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: "الوقت غير مناسب للجهة المالكة" })
  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @ApiPropertyOptional({ example: "اعتذر العميل بسبب ظروف خاصة" })
  @IsString()
  @IsOptional()
  cancellationReason?: string;
}

export class AssignEmployeeDto {
  @ApiProperty({ example: "uuid-user-id" })
  @IsString()
  @IsNotEmpty()
  assignedEmployeeId: string;
}

export class QueryAppointmentsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: AppointmentStatus })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  propertyId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  assignedEmployeeId?: string;

  @ApiPropertyOptional({ example: "2026-04-01" })
  @IsString()
  @IsOptional()
  fromDate?: string;

  @ApiPropertyOptional({ example: "2026-04-30" })
  @IsString()
  @IsOptional()
  toDate?: string;
}

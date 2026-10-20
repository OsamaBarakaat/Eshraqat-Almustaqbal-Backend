import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CreateAppointmentDto,
  UpdateAppointmentStatusDto,
  AssignEmployeeDto,
  QueryAppointmentsDto,
} from "./dto/appointments.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  private appointmentIncludes = {
    property: {
      select: {
        id: true,
        code: true,
        title: true,
        city: true,
        areaName: true,
      },
    },
    assignedEmployee: {
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    },
  };

  private mapAppointmentResponse(a: any) {
    return {
      id: a.id,
      customerName: a.customerName,
      customerPhone: a.customerPhone,
      customerEmail: a.customerEmail,
      propertyId: a.propertyId,
      propertyCode: a.property?.code || "",
      propertyTitle: a.property?.title || "",
      propertyLocation: a.property ? `${a.property.city} - ${a.property.areaName}` : "",
      requestedDate: a.requestedDate instanceof Date ? a.requestedDate.toISOString().split("T")[0] : a.requestedDate,
      requestedTime: a.requestedTime,
      status: a.status,
      assignedEmployeeId: a.assignedEmployeeId,
      assignedEmployeeName: a.assignedEmployee?.name || null,
      notes: a.notes,
      rejectionReason: a.rejectionReason,
      cancellationReason: a.cancellationReason,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    };
  }

  async findAll(query: QueryAppointmentsDto) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      propertyId,
      assignedEmployeeId,
      fromDate,
      toDate,
      sortBy = "requestedDate",
      sortOrder = "asc",
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.AppointmentWhereInput = {};

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
        { property: { title: { contains: search, mode: "insensitive" } } },
        { property: { code: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) where.status = status;
    if (propertyId) where.propertyId = propertyId;
    if (assignedEmployeeId) where.assignedEmployeeId = assignedEmployeeId;

    if (fromDate || toDate) {
      where.requestedDate = {};
      if (fromDate) where.requestedDate.gte = new Date(fromDate);
      if (toDate) where.requestedDate.lte = new Date(toDate);
    }

    const [rawItems, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        include: this.appointmentIncludes,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      items: rawItems.map((item) => this.mapAppointmentResponse(item)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const a = await this.prisma.appointment.findUnique({
      where: { id },
      include: this.appointmentIncludes,
    });

    if (!a) throw new NotFoundException("الموعد غير موجود");
    return this.mapAppointmentResponse(a);
  }

  async create(dto: CreateAppointmentDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });
    if (!property) throw new BadRequestException("العقار المحدد لطلب المعاينة غير موجود");

    const created = await this.prisma.appointment.create({
      data: {
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        customerEmail: dto.customerEmail,
        propertyId: dto.propertyId,
        requestedDate: new Date(dto.requestedDate),
        requestedTime: dto.requestedTime,
        notes: dto.notes,
      },
      include: this.appointmentIncludes,
    });

    return this.mapAppointmentResponse(created);
  }

  async updateStatus(id: string, dto: UpdateAppointmentStatusDto) {
    const existing = await this.prisma.appointment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("الموعد غير موجود");

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.rejectionReason !== undefined && { rejectionReason: dto.rejectionReason }),
        ...(dto.cancellationReason !== undefined && { cancellationReason: dto.cancellationReason }),
      },
      include: this.appointmentIncludes,
    });

    return this.mapAppointmentResponse(updated);
  }

  async assignEmployee(id: string, dto: AssignEmployeeDto) {
    const [appointment, employee] = await Promise.all([
      this.prisma.appointment.findUnique({ where: { id } }),
      this.prisma.user.findUnique({ where: { id: dto.assignedEmployeeId } }),
    ]);

    if (!appointment) throw new NotFoundException("الموعد غير موجود");
    if (!employee) throw new BadRequestException("الموظف المحدد غير موجود");

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { assignedEmployeeId: dto.assignedEmployeeId },
      include: this.appointmentIncludes,
    });

    return this.mapAppointmentResponse(updated);
  }

  async delete(id: string) {
    const existing = await this.prisma.appointment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("الموعد غير موجود");

    await this.prisma.appointment.delete({ where: { id } });
    return { success: true, message: "تم حذف موعد المعاينة بنجاح" };
  }
}

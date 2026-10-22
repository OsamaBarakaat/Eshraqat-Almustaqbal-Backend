import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { AppointmentsService } from "./appointments.service";
import {
  CreateAppointmentDto,
  UpdateAppointmentStatusDto,
  AssignEmployeeDto,
  QueryAppointmentsDto,
} from "./dto/appointments.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { ModuleType, ActionType } from "@prisma/client";

@ApiTags("Appointments (Property Viewings)")
@Controller("appointments")
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // ================= PUBLIC WEBSITE BOOKING & TRACKING =================
  @Public()
  @Post("book")
  @ApiOperation({ summary: "Book a property viewing appointment from the public website" })
  bookFromWebsite(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(dto);
  }

  @Public()
  @Get("client")
  @ApiOperation({ summary: "Get viewing appointments for client by email or phone" })
  findClientBookings(
    @Query("email") email?: string,
    @Query("phone") phone?: string,
  ) {
    return this.appointmentsService.findClientBookings(email, phone);
  }

  @Public()
  @Patch("client/:id/cancel")
  @ApiOperation({ summary: "Cancel viewing appointment by client" })
  cancelClientBooking(
    @Param("id") id: string,
    @Body("email") email?: string,
  ) {
    return this.appointmentsService.cancelClientBooking(id, email);
  }

  // ================= ADMIN DASHBOARD ENDPOINTS =================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.appointments, actions: [ActionType.view] })
  @Get()
  @ApiOperation({ summary: "Get all viewing appointments with filters and search" })
  findAll(@Query() query: QueryAppointmentsDto) {
    return this.appointmentsService.findAll(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.appointments, actions: [ActionType.view] })
  @Get(":id")
  @ApiOperation({ summary: "Get appointment details by ID" })
  findOne(@Param("id") id: string) {
    return this.appointmentsService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.appointments, actions: [ActionType.create] })
  @Post()
  @ApiOperation({ summary: "Create an appointment from admin dashboard" })
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.appointments, actions: [ActionType.edit] })
  @Patch(":id/status")
  @ApiOperation({ summary: "Confirm, reject, cancel, or complete an appointment" })
  updateStatus(@Param("id") id: string, @Body() dto: UpdateAppointmentStatusDto) {
    return this.appointmentsService.updateStatus(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.appointments, actions: [ActionType.assign] })
  @Patch(":id/assign")
  @ApiOperation({ summary: "Assign a sales agent to an appointment" })
  assignEmployee(@Param("id") id: string, @Body() dto: AssignEmployeeDto) {
    return this.appointmentsService.assignEmployee(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.appointments, actions: [ActionType.delete] })
  @Delete(":id")
  @ApiOperation({ summary: "Delete an appointment" })
  delete(@Param("id") id: string) {
    return this.appointmentsService.delete(id);
  }
}

import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateRoleDto, UpdateRolePermissionsDto } from "./dto/roles.dto";
import { RoleCode } from "@prisma/client";

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: true,
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: true, users: true },
    });
    if (!role) {
      throw new NotFoundException("الدور الوظيفي غير موجود");
    }
    return role;
  }

  async create(dto: CreateRoleDto) {
    // Check code existence
    const existing = await this.prisma.role.findFirst({
      where: { code: dto.code as RoleCode },
    });
    if (existing) {
      throw new BadRequestException("كود هذا الدور مستخدم مسبقاً");
    }

    return this.prisma.role.create({
      data: {
        code: dto.code as RoleCode,
        titleArabic: dto.titleArabic,
        description: dto.description,
        isSystem: false,
        permissions: {
          create: dto.permissions.map((p) => ({
            module: p.module,
            actions: p.actions,
          })),
        },
      },
      include: { permissions: true },
    });
  }

  async update(id: string, dto: UpdateRolePermissionsDto) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException("الدور الوظيفي غير موجود");
    }

    // Delete existing permissions and re-create in transaction
    return this.prisma.$transaction(async (tx) => {
      await tx.permission.deleteMany({
        where: { roleId: id },
      });

      return tx.role.update({
        where: { id },
        data: {
          titleArabic: dto.titleArabic ?? role.titleArabic,
          description: dto.description ?? role.description,
          permissions: {
            create: dto.permissions.map((p) => ({
              module: p.module,
              actions: p.actions,
            })),
          },
        },
        include: { permissions: true },
      });
    });
  }

  async delete(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!role) {
      throw new NotFoundException("الدور غير موجود");
    }

    if (role.isSystem) {
      throw new BadRequestException("لا يمكن حذف الأدوار الافتراضية للنظام");
    }

    if (role._count.users > 0) {
      throw new BadRequestException("لا يمكن حذف الدور لوجود موظفين مرتبطين به حالياً");
    }

    await this.prisma.role.delete({ where: { id } });
    return { success: true, message: `تم حذف الدور (${role.titleArabic}) بنجاح` };
  }
}

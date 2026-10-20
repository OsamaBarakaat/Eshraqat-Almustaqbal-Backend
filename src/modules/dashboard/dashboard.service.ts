import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { PropertyStatus, PropertyCategory, AppointmentStatus, InquiryStatus, LeadStatus } from "@prisma/client";

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalProperties,
      publishedProperties,
      draftProperties,
      archivedProperties,
      discountedProperties,
      pendingAppointments,
      upcomingAppointments,
      newInquiries,
      totalClients,
      convertedClients,
      residentialCount,
      commercialCount,
      agriculturalCount,
      recentAppointments,
      recentInquiries,
      recentClients,
    ] = await Promise.all([
      this.prisma.property.count(),
      this.prisma.property.count({ where: { status: PropertyStatus.PUBLISHED } }),
      this.prisma.property.count({ where: { status: PropertyStatus.DRAFT } }),
      this.prisma.property.count({ where: { status: PropertyStatus.ARCHIVED } }),
      this.prisma.property.count({ where: { originalPrice: { not: null }, discountPercentage: { gt: 0 } } }),
      this.prisma.appointment.count({ where: { status: AppointmentStatus.PENDING_CONFIRMATION } }),
      this.prisma.appointment.count({
        where: {
          status: AppointmentStatus.CONFIRMED,
          requestedDate: { gte: today },
        },
      }),
      this.prisma.inquiry.count({ where: { status: InquiryStatus.NEW } }),
      this.prisma.client.count(),
      this.prisma.client.count({ where: { status: LeadStatus.CONVERTED } }),
      this.prisma.property.count({ where: { category: PropertyCategory.RESIDENTIAL } }),
      this.prisma.property.count({ where: { category: PropertyCategory.COMMERCIAL } }),
      this.prisma.property.count({ where: { category: PropertyCategory.AGRICULTURAL } }),
      this.prisma.appointment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          property: { select: { title: true, code: true } },
          assignedEmployee: { select: { name: true } },
        },
      }),
      this.prisma.inquiry.findMany({
        take: 5,
        orderBy: { submittedAt: "desc" },
        include: {
          relatedProperty: { select: { title: true, code: true } },
        },
      }),
      this.prisma.client.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          phone: true,
          status: true,
          source: true,
          createdAt: true,
        },
      }),
    ]);

    const totalCalculated = residentialCount + commercialCount + agriculturalCount || 1;
    const distribution = [
      {
        name: "سكني",
        category: PropertyCategory.RESIDENTIAL,
        count: residentialCount,
        percentage: Math.round((residentialCount / totalCalculated) * 100),
        color: "#059669",
      },
      {
        name: "تجاري",
        category: PropertyCategory.COMMERCIAL,
        count: commercialCount,
        percentage: Math.round((commercialCount / totalCalculated) * 100),
        color: "#2563EB",
      },
      {
        name: "زراعي",
        category: PropertyCategory.AGRICULTURAL,
        count: agriculturalCount,
        percentage: Math.round((agriculturalCount / totalCalculated) * 100),
        color: "#D97706",
      },
    ];

    return {
      stats: {
        totalProperties,
        publishedProperties,
        draftProperties,
        archivedProperties,
        discountedProperties,
        totalProjects: 6, // Target projects in pipeline
        pendingAppointments,
        upcomingAppointments,
        newInquiries,
        totalClients,
        convertedClients,
      },
      distribution,
      recent: {
        appointments: recentAppointments,
        inquiries: recentInquiries,
        clients: recentClients,
      },
    };
  }
}

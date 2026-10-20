import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { RolesModule } from "./modules/roles/roles.module";
import { UsersModule } from "./modules/users/users.module";
import { LocationsModule } from "./modules/locations/locations.module";
import { PropertiesModule } from "./modules/properties/properties.module";
import { MediaModule } from "./modules/media/media.module";
import { AppointmentsModule } from "./modules/appointments/appointments.module";
import { ClientsModule } from "./modules/clients/clients.module";
import { InquiriesModule } from "./modules/inquiries/inquiries.module";
import { CmsModule } from "./modules/cms/cms.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { AuditModule } from "./modules/audit/audit.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuditModule,
    AuthModule,
    RolesModule,
    UsersModule,
    LocationsModule,
    PropertiesModule,
    MediaModule,
    AppointmentsModule,
    ClientsModule,
    InquiriesModule,
    CmsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

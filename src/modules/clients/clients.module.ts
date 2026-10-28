import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { ClientsService } from "./clients.service";
import { ClientsController } from "./clients.controller";
import { CustomerAuthController } from "./customer-auth.controller";
import { PasswordRecoveryController } from "./password-recovery.controller";
import { CustomerAuthService } from "./customer-auth.service";

@Module({
  imports: [
    JwtModule.register({}),
    ConfigModule,
  ],
  controllers: [
    ClientsController,
    CustomerAuthController,
    PasswordRecoveryController,
  ],
  providers: [ClientsService, CustomerAuthService],
  exports: [ClientsService, CustomerAuthService],
})
export class ClientsModule {}

import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MapInteractionsController } from "./map-interactions.controller";
import { MapInteractionsService } from "./map-interactions.service";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>("JWT_SECRET") ||
          "eshraqat-almustaqbal-ultra-secure-jwt-secret-key-2026",
        signOptions: { expiresIn: "30d" },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MapInteractionsController],
  providers: [MapInteractionsService],
  exports: [MapInteractionsService],
})
export class MapInteractionsModule {}

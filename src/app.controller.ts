import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Public } from "./common/decorators/public.decorator";

@ApiTags("System Health")
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: "System root status" })
  getRoot() {
    return {
      service: "Eshraqat Al-Mustaqbal Real Estate API",
      status: "online",
      version: "1.0.0",
      documentation: "/api/docs",
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get("health")
  @ApiOperation({ summary: "Health check" })
  getHealth() {
    return {
      status: "UP",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}

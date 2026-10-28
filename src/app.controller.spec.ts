import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("root", () => {
    it("should return root service info", () => {
      expect(appController.getRoot().service).toContain("Eshraqat Al-Mustaqbal");
    });

    it("should return health status UP", () => {
      expect(appController.getHealth().status).toBe("UP");
    });
  });
});

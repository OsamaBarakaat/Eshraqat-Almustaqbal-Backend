import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Query,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { MediaService, UploadResult } from "./media.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

const imageFileFilter = (
  _req: unknown,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|svg\+xml|avif)$/)) {
    return callback(new BadRequestException("صيغة الملف غير مدعومة. الصيغ المسموحة هي: JPG, PNG, WEBP, AVIF"), false);
  }
  callback(null, true);
};

@ApiTags("Media & File Upload")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("media")
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post("upload")
  @ApiOperation({ summary: "Upload a single image (e.g. primary property cover, avatar, or banner)" })
  @ApiConsumes("multipart/form-data")
  @ApiQuery({ name: "folder", required: false, example: "properties" })
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: imageFileFilter,
    }),
  )
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Query("folder") folder = "properties",
  ): Promise<UploadResult> {
    return this.mediaService.uploadFile(file, folder);
  }

  @Post("upload-multiple")
  @ApiOperation({ summary: "Upload multiple property images at once (up to 20 images)" })
  @ApiConsumes("multipart/form-data")
  @ApiQuery({ name: "folder", required: false, example: "properties" })
  @UseInterceptors(
    FilesInterceptor("files", 20, {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
      fileFilter: imageFileFilter,
    }),
  )
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Query("folder") folder = "properties",
  ): Promise<UploadResult[]> {
    return this.mediaService.uploadMultipleFiles(files, folder);
  }
}

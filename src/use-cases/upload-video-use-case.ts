import { FileTooLargeError } from "@/core/errors/file-too-long-error";
import { InvalidFileTypeError } from "@/core/errors/invalid-file-type-error";
import { IUploadVideoRequest } from "@/core/interfaces/upload-video-request-use-case";
import { IVideoRepository } from "@/core/interfaces/video-repository";

export class UploadVideoUseCase {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly maxFileSizeMB: number = 10
  ) {}

  validateFile(file: IUploadVideoRequest["file"]): void {
    if (!file.mimetype.startsWith("video/")) {
      throw new InvalidFileTypeError();
    }

    const maxSizeBytes = this.maxFileSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new FileTooLargeError(this.maxFileSizeMB);
    }
  }

  async execute(request: IUploadVideoRequest): Promise<void> {
    this.validateFile(request.file);

    await this.videoRepository.save({
      filename: request.file.originalname,
      buffer: request.file.buffer,
    });
  }
}

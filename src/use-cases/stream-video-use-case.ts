import { VideoNotFoundError } from "@/core/errors/video-not-found-error";
import {
  IStreamVideoRequest,
  IStreamVideoResponse,
} from "@/core/interfaces/stream-video-use-case";
import { IVideoRepository } from "@/core/interfaces/video-repository";

export class StreamVideoUseCase {
  constructor(private readonly videoRepository: IVideoRepository) {}

  private async getVideoBuffer(filename: string): Promise<Buffer> {
    const buffer = await this.videoRepository.get(filename);

    if (!buffer) {
      throw new VideoNotFoundError(filename);
    }

    return buffer;
  }

  private handleRangeRequest(
    buffer: Buffer,
    rangeHeader: string
  ): IStreamVideoResponse {
    const fileSize = buffer.length;
    const [startStr, endStr] = rangeHeader.replace(/bytes=/, "").split("-");

    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : fileSize - 1;

    this.validateRange(start, end, fileSize);

    const contentLength = end - start + 1;
    const partialBuffer = buffer.subarray(start, end + 1);

    return {
      buffer: partialBuffer,
      contentRange: `bytes ${start}-${end}/${fileSize}`,
      contentLength,
      isPartial: true,
    };
  }

  private validateRange(start: number, end: number, fileSize: number): void {
    const errors: string[] = [];

    if (isNaN(start) || isNaN(end)) errors.push("Must be numbers");
    if (start < 0) errors.push("Start cannot be negative");
    if (start >= fileSize) errors.push("Start exceeds file size");
    if (end >= fileSize) errors.push("End exceeds file size");
    if (start > end) errors.push("Start greater than end");

    if (errors.length) {
      throw new Error(`Invalid range: ${errors.join(", ")}`);
    }
  }

  async execute(request: IStreamVideoRequest): Promise<IStreamVideoResponse> {
    const buffer = await this.getVideoBuffer(request.filename);

    if (!request.range) {
      return {
        buffer,
        contentLength: buffer.length,
        isPartial: false,
      };
    }

    return this.handleRangeRequest(buffer, request.range);
  }
}

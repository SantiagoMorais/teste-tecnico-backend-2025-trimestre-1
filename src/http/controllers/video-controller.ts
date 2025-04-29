import { FileTooLargeError } from "@/core/errors/file-too-long-error";
import { InvalidFileTypeError } from "@/core/errors/invalid-file-type-error";
import { InvalidRangeError } from "@/core/errors/invalid-range-error";
import { VideoNotFoundError } from "@/core/errors/video-not-found-error";
import { StreamVideoUseCase } from "@/use-cases/stream-video-use-case";
import { UploadVideoUseCase } from "@/use-cases/upload-video-use-case";
import { Request, Response } from "express";

export class VideoController {
  constructor(
    private readonly uploadVideoUseCase: UploadVideoUseCase,
    private readonly streamVideoUseCase: StreamVideoUseCase
  ) {}

  async upload(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      if (!req.file.mimetype.startsWith("video/")) {
        throw new InvalidFileTypeError();
      }

      if (req.file.size > 10 * 1024 * 1024) {
        throw new FileTooLargeError(10);
      }

      await this.uploadVideoUseCase.execute({
        file: {
          originalname: req.file.originalname,
          buffer: req.file.buffer,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
      });

      return res.status(204).send();
    } catch (error) {
      if (error instanceof InvalidFileTypeError) {
        return res.status(400).json({ error: error.message });
      }
      if (error instanceof FileTooLargeError) {
        return res.status(400).json({ error: error.message });
      }
      console.error("Erro interno:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }

  async stream(req: Request, res: Response): Promise<void> {
    try {
      const { filename } = req.params;
      const range = req.headers.range;

      const result = await this.streamVideoUseCase.execute({
        filename,
        range: range?.toString(),
      });

      this.sendVideoResponse(res, result);
    } catch (error) {
      this.handleStreamError(error, res);
    }
  }

  private sendVideoResponse(
    res: Response,
    result: {
      buffer: Buffer;
      contentRange?: string;
      contentLength: number;
      isPartial: boolean;
    }
  ): void {
    const headers = {
      "Content-Length": result.contentLength,
      "Content-Type": "video/mp4",
      ...(result.contentRange && { "Content-Range": result.contentRange }),
      "Accept-Ranges": "bytes",
    };

    res.writeHead(result.isPartial ? 206 : 200, headers);
    res.end(result.buffer);
  }

  private handleUploadError(error: unknown, res: Response): Response {
    if (error instanceof InvalidFileTypeError) {
      return res
        .status(400)
        .json({ error: error.message, code: "INVALID_FILE_TYPE" });
    }

    if (error instanceof FileTooLargeError) {
      return res.status(400).json({ error: error.message });
    }

    console.error("Upload error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }

  private handleStreamError(error: unknown, res: Response): Response {
    if (error instanceof VideoNotFoundError) {
      return res.status(404).json({ error: error.message });
    }

    if (error instanceof InvalidRangeError) {
      return res.status(416).json({ error: error.message });
    }

    console.error("Stream error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

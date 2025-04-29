import { IVideoRepository } from "@/core/interfaces/video-repository";
import fs from "fs/promises";
import path from "path";

export class FileSystemVideoRepository implements IVideoRepository {
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(__dirname, "..", "..", "uploads");
    this.ensureUploadDirExists().catch(console.error);
  }

  private async ensureUploadDirExists(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch (err) {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async save({
    filename,
    buffer,
  }: {
    filename: string;
    buffer: Buffer;
  }): Promise<void> {
    try {
      await this.ensureUploadDirExists();
      await fs.writeFile(path.join(this.uploadDir, filename), buffer);
    } catch (error) {
      console.error("Erro ao persistir vídeo:", error);
      throw new Error("Error saving the file into the system");
    }
    await fs.writeFile(path.join(this.uploadDir, filename), buffer);
  }

  async get(filename: string): Promise<Buffer | null> {
    try {
      return await fs.readFile(path.join(this.uploadDir, filename));
    } catch {
      return null;
    }
  }

  async exists(filename: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.uploadDir, filename));
      return true;
    } catch {
      return false;
    }
  }
}

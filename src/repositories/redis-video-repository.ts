import { IVideoRepository } from "@/core/interfaces/video-repository";
import { createClient } from "redis";

export class RedisVideoRepository implements IVideoRepository {
  private client: ReturnType<typeof createClient>;

  constructor() {
    this.client = createClient({
      url: "redis://localhost:6379",
    });
    this.client.on("error", (err) => console.error("Redis Client Error", err));
    this.client.connect();
  }

  async save({
    filename,
    buffer,
  }: {
    filename: string;
    buffer: Buffer;
  }): Promise<void> {
    await this.client.setEx(filename, 60, buffer.toString("base64"));
  }

  async get(filename: string): Promise<Buffer | null> {
    const response = await this.client.get(filename);
    return response ? Buffer.from(response, "base64") : null;
  }

  async exists(filename: string): Promise<boolean> {
    return (await this.client.exists(filename)) === 1;
  }
}

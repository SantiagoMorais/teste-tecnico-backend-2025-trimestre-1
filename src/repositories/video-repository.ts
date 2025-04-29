import { IVideoRepository } from "@/core/interfaces/video-repository";
import { RedisVideoRepository } from "./redis-video-repository";
import { FileSystemVideoRepository } from "./file-system-video-repository";

export class VideoRepository implements IVideoRepository {
  constructor(
    private readonly cacheRepository: IVideoRepository = new RedisVideoRepository(),
    private readonly storageRepository: IVideoRepository = new FileSystemVideoRepository()
  ) {}

  async save({
    filename,
    buffer,
  }: {
    filename: string;
    buffer: Buffer;
  }): Promise<void> {
    await this.cacheRepository.save({ filename, buffer });

    this.storageRepository
      .save({ filename, buffer })
      .catch((err) => console.error("Failed to persist video", err));
  }

  async get(filename: string): Promise<Buffer | null> {
    const cachedVideo = await this.cacheRepository.get(filename);
    if (cachedVideo) return cachedVideo;

    const storedVideo = await this.storageRepository.get(filename);
    if (storedVideo) {
      this.cacheRepository
        .save({ filename, buffer: storedVideo })
        .catch(console.error);
    }

    return storedVideo;
  }

  async exists(filename: string): Promise<boolean> {
    return (
      (await this.cacheRepository.exists(filename)) ||
      (await this.storageRepository.exists(filename))
    );
  }
}

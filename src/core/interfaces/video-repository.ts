export interface IVideoRepository {
  save(video: { filename: string; buffer: Buffer }): Promise<void>;
  get(filename: string): Promise<Buffer | null>;
  exists(filename: string): Promise<boolean>;
}

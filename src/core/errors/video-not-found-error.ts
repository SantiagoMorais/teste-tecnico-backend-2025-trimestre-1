export class VideoNotFoundError extends Error {
  constructor(filename: string) {
    super(`Video '${filename}' not found`);
    this.name = "VideoNotFoundError";
  }
}

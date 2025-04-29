export interface IStreamVideoRequest {
  filename: string;
  range?: string;
}

export interface IStreamVideoResponse {
  buffer: Buffer;
  contentRange?: string;
  contentLength: number;
  isPartial: boolean;
}

export interface IUploadVideoRequest {
  file: {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
    size: number;
  };
}

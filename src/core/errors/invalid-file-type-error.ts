export class InvalidFileTypeError extends Error {
  constructor() {
    super("Invalid file type. Only video files are allowed");
    this.name = "InvalidFileTypeError";
  }
}

export class FileTooLargeError extends Error {
  constructor(maxSizeInMB: number) {
    super(`File exceeds maximum size of ${maxSizeInMB}MB`);
    this.name = "FileTooLargeError";
  }
}

import multer from "multer";
import { Router } from "express";
import { FileSystemVideoRepository } from "@/repositories/file-system-video-repository";
import { RedisVideoRepository } from "@/repositories/redis-video-repository";
import { VideoRepository } from "@/repositories/video-repository";
import { VideoController } from "../controllers/video-controller";
import { UploadVideoUseCase } from "@/use-cases/upload-video-use-case";
import { StreamVideoUseCase } from "@/use-cases/stream-video-use-case";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

const videoRepository = new VideoRepository(
  new RedisVideoRepository(),
  new FileSystemVideoRepository()
);

const videoController = new VideoController(
  new UploadVideoUseCase(videoRepository),
  new StreamVideoUseCase(videoRepository)
);

router.post("/upload/video", upload.single("video"), (req, res) => {
  videoController.upload(req, res);
});

router.get("/static/video/:filename", (req, res) => {
  videoController.stream(req, res);
});

export default router;

import express from "express";
import videoRoutes from "@/http/routes/video-routes";

export const app = express();
const PORT = 3000;

app.get("/", (_, res) => {
  res.status(200).json({ message: "It's working" });
});

app.use(express.json());
app.use(videoRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

import express from "express";

export const app = express();
const PORT = 3000;

app.get("/", (_, res) => {
  res.status(200).json({ message: "It's working" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

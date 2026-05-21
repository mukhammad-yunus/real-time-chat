import express, { Request, Response } from "express";

export const app = express();

app.use(express.json({ limit: "32kb" }));

app.get("/", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    message: "real-time-chat API",
  });
});

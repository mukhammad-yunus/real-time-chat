import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";

export const app = express();

app.use(express.json({ limit: "32kb" }));

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "Real-Time-Chat API",
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

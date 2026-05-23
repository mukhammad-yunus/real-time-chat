import express from "express";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";

export const app = express();

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "32kb" }));

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "Real-Time-Chat API"
  });
});

app.use(notFoundHandler);
app.use(errorHandler);
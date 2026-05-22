import type { ErrorRequestHandler } from "express";
import { ApiError } from "../errors/api-error.js";
import { env } from "../config/env.js";

export const notFoundHandler = () => {
  throw new ApiError(404, "NOT_FOUND", "Route not found");
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      ok: false,
      error: {
        code: error.code,
        message: error.message
      }
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    ok: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message:
        env.NODE_ENV === "production"
          ? "Something went wrong"
          : error instanceof Error
            ? error.message
            : "Unknown error"
    }
  });
};

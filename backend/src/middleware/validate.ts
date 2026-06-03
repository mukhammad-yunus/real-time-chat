import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../errors/api-error.js";


type RequestSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export function validate(schemas: RequestSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const bodyResult = schemas.body?.safeParse(req.body);
    if (bodyResult && !bodyResult.success) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        bodyResult.error.issues[0]?.message ?? "Invalid request body",
      );
    }
    if (bodyResult?.success) {
      req.body = bodyResult.data;
    }

    const paramsResult = schemas.params?.safeParse(req.params);
    if (paramsResult && !paramsResult.success) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        paramsResult.error.issues[0]?.message ?? "Invalid route parameters",
      );
    }

    const queryResult = schemas.query?.safeParse(req.query);
    if (queryResult && !queryResult.success) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        queryResult.error.issues[0]?.message ?? "Invalid query string",
      );
    }

    next();
  };
}

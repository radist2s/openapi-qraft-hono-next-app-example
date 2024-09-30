import type { ValidationErrorResponse } from "@/api/client/schema";
import { type RequestFnResponse } from "@openapi-qraft/react";

export async function serializeActionResponse<TData, TError>(
  responseResult:
    | RequestFnResponse<TData, TError>
    | Promise<RequestFnResponse<TData, TError>>,
) {
  // Exclude `response` from the result, as it should not be returned to the client
  const result = await responseResult;
  if (result.data) {
    return { data: result.data, error: undefined };
  }

  // Native Error should be serialized to JSON
  if (result.error instanceof Error) {
    const serializedError: ValidationErrorResponse = {
      issues: [
        {
          path: [],
          message: result.error.message,
          fatal: true,
          code: "custom",
        },
      ],
    };

    return {
      data: undefined,
      error: serializedError,
    };
  }

  return { data: undefined, error: result.error! };
}

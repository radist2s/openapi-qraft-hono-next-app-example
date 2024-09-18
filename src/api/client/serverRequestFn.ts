import {
  bodySerializer,
  mergeHeaders,
  type OperationSchema,
  RequestFnInfo,
  RequestFnResponse,
  urlSerializer,
} from "@openapi-qraft/react";
import {
  processResponse,
  resolveResponse,
} from "@openapi-qraft/react/unstable__responseUtils";
import { type OpenAPIHono } from "@hono/zod-openapi";
import { app } from "@/api/app";

/**
 * A server-side request function for OpenAPI Qraft that performs requests
 * directly within the Hono framework, bypassing actual HTTP requests.
 *
 * @remarks
 * This function is intended for use in server environments where you want to
 * simulate HTTP requests without incurring the overhead of network communication.
 */
export const serverRequestFn = createServerRequestFn(app);

function createServerRequestFn(app: OpenAPIHono) {
  return async function serverRequestFn<TData, TError>(
    requestSchema: OperationSchema,
    requestInfo: RequestFnInfo,
  ): Promise<RequestFnResponse<TData, TError>> {
    const { parameters, headers, body, ...requestInfoRest } = requestInfo;

    const requestPayload = bodySerializer(requestSchema, body);

    try {
      // Perform a direct request to Hono without making an actual HTTP call
      const response = await app.request(
        urlSerializer(requestSchema, requestInfo),
        {
          method: requestSchema.method.toUpperCase(),
          body: requestPayload?.body,
          headers: mergeHeaders(
            { Accept: "application/json" },
            requestPayload?.headers,
            headers,
            parameters?.header,
          ),
          ...requestInfoRest,
        },
      );

      return processResponse(response);
    } catch (error) {
      return resolveResponse(error as Error);
    }
  };
}

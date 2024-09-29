import "server-only";
import type { OpenAPIHono } from "@hono/zod-openapi";
import type { OperationSchema } from "@openapi-qraft/react";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { app } from "@my-project/api";
import {
  bodySerializer,
  mergeHeaders,
  RequestFnInfo,
  RequestFnResponse,
  urlSerializer,
} from "@openapi-qraft/react";
import {
  processResponse,
  resolveResponse,
} from "@openapi-qraft/react/unstable__responseUtils";
import { cookies as nextCookies, headers as nextHeaders } from "next/headers";
import cookieParser from "set-cookie-parser";

/**
 * A server-side request function for OpenAPI Qraft that performs requests
 * directly within the Hono framework, bypassing actual HTTP requests.
 *
 * @remarks
 * This function is intended for use in server environments where you want to
 * simulate HTTP requests without incurring the overhead of network communication.
 */
export const serverRequestFn = createServerRequestFn(app);

function createServerRequestFn<HonoApp extends OpenAPIHono<any>>(app: HonoApp) {
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
            Object.fromEntries(nextHeaders().entries()),
            { Accept: "application/json" },
            requestPayload?.headers,
            headers,
            parameters?.header,
          ),
          ...requestInfoRest,
        },
      );

      const cookieHeader = response.headers.get("set-cookie");

      if (cookieHeader) {
        cookieParser
          .splitCookiesString(cookieHeader)
          .forEach((cookieString) => {
            cookieParser
              .parse(cookieString, { silent: true })
              .forEach(({ name, value, ...options }) => {
                nextCookies().set(name, value, options as ResponseCookie);
              });
          });
      }

      return processResponse(response);
    } catch (error) {
      return resolveResponse(error as Error);
    }
  };
}

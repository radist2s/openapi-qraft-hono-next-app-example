"use server";
import { createAPIClient, type Services } from "@/api/client";
import { serverRequestFn } from "@/api/client/serverRequestFn";

export async function updateUserAction(
  userPayload: Services["users"]["update"]["types"]["body"],
) {
  const qraft = createAPIClient({
    requestFn: serverRequestFn,
    baseUrl: "",
  });

  // Exclude `response` from the result, as it should not be returned to the client
  const { response: _, ...result } = await qraft.users.update({
    body: userPayload,
  });

  // Native Error should be serialized to JSON
  if (result.error instanceof Error) {
    return {
      data: undefined,
      error: {
        issues: [
          {
            path: [],
            message: result.error.message,
            fatal: true,
            code: "custom",
          },
        ],
      } satisfies Services["users"]["update"]["types"]["error"],
    };
  }

  return result;
}

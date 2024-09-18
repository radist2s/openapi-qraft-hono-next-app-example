"use server";
import { createAPIClient, type Services } from "@/api/client";
import { serverRequestFn } from "@/api/serverRequestFn";
import { serializeActionResponse } from "@/utils/serializeActionResponse";

export async function updateUserAction(
  userPayload: Services["users"]["update"]["types"]["body"],
) {
  const qraft = createAPIClient({
    requestFn: serverRequestFn,
    baseUrl: "",
  });

  return serializeActionResponse(
    qraft.users.update({
      // the payload could be a `FormData` or a JSON object
      body: userPayload,
    }),
  );
}

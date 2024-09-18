"use server";
import { createAPIClient, type Services } from "@/api/client";
import type { User, ValidationErrorResponse } from "@/api/client/schema";
import { serverRequestFn } from "@/api/serverRequestFn";
import {
  serializeActionResponse,
  SerializedAPIErrorResponse,
} from "@/utils/serializeActionResponse";

export async function createUserAction(
  _prevState: CreateUserFormState,
  formData: Services["users"]["create"]["types"]["body"],
): Promise<CreateUserFormState> {
  const qraft = createAPIClient({
    requestFn: serverRequestFn,
    baseUrl: "",
  });

  return serializeActionResponse(
    qraft.users.create({
      // the payload could be a `FormData` or a JSON object
      body: formData,
    }),
  );
}

export type CreateUserFormState = {
  data?: User;
  error?: ValidationErrorResponse | SerializedAPIErrorResponse;
};

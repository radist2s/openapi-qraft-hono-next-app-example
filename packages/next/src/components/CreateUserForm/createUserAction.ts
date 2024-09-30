"use server";

import type { User, ValidationErrorResponse } from "@/api/client/schema";
import {
  createAPIClient,
  Services,
  UnauthorizedErrorResponse,
} from "@/api/client";
import { serverRequestFn } from "@/api/serverRequestFn";
import { serializeActionResponse } from "@/utils/serializeActionResponse";

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
  error?: ValidationErrorResponse | UnauthorizedErrorResponse;
};

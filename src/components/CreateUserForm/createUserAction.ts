"use server";
import { createAPIClient, ValidationError } from "@/api/client";
import { serverRequestFn } from "@/api/client/serverRequestFn";

export async function createUserAction(
  _prevState: CreateUserFormState,
  formData: FormData,
): Promise<CreateUserFormState> {
  const qraft = createAPIClient({
    requestFn: serverRequestFn,
    baseUrl: "",
  });

  const { error: errors } = await qraft.users.create({
    body: formData,
  });

  if (errors) {
    if (errors instanceof Error) {
      const error: SystemError = {
        message: errors.message,
        fatal: true,
        code: "system",
      };

      return { errors: [error] };
    }

    return { errors: errors.issues };
  }

  return { success: Date.now() };
}

type SystemError = {
  message: string;
  fatal: true;
  code: "system";
};

export type CreateUserFormState =
  | {
      errors: Array<ValidationError | SystemError>;
      success?: never;
    }
  | {
      /** Timestamp in milliseconds */
      success?: number;
      errors?: never;
    }
  | Record<string, never>;
